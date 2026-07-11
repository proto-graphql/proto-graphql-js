import {
  create,
  type Message,
  type MessageInitShape,
  toBinary,
} from "@bufbuild/protobuf";
import type {
  GenMessage,
  GenService,
  GenServiceMethods,
} from "@bufbuild/protobuf/codegenv2";
import type { CallOptions, Client } from "@connectrpc/connect";
import DataLoader from "dataloader";
import { getClient } from "./client.js";
import type { ProtoGraphqlConnectContext } from "./context.js";

/**
 * Key types a `createRpcLoader` loader can index by. Mirrors the proto
 * scalar types that map onto `Map` key equality without extra work (see
 * design.md §4.4); composite/message keys are not supported.
 */
export type RpcLoaderKey = string | number | bigint;

/**
 * Config for `createRpcLoader`. `Group` selects the loader's shape: unset or
 * `false` produces an entity loader (`DataLoader<K, E | null>`), `true`
 * produces a group loader (`DataLoader<K, E[]>`).
 */
export interface CreateRpcLoaderConfig<
  S extends GenService<GenServiceMethods>,
  K extends RpcLoaderKey,
  E,
  Req extends Message,
  Res,
  Group extends boolean = false,
> {
  /** The Connect-ES service the loader calls through {@link getClient}. */
  service: S;
  /** RPC method name. Diagnostics only (error messages, labels) — never invoked by the runtime. */
  method: string;
  /**
   * Schema of the RPC's request message. Used only to normalize `params`
   * and derive the per-params cache key (§4.5) — building the actual
   * request sent over the wire is entirely `call`'s responsibility.
   */
  requestSchema: GenMessage<Req>;
  /**
   * Performs the RPC for one batch. Receives the memoized client, the keys
   * DataLoader collected for this batch, the loader's params (defaulted to
   * `{}` when omitted), and the resolved `CallOptions`.
   *
   * Called at most once per batch. If it throws or rejects, every key in
   * the batch rejects with that same error — this package never converts
   * RPC errors into per-key results.
   */
  // `keys`/`params` are wrapped in `NoInfer` so K and Req are never inferred
  // from this position — only checked against whatever `extractKey`'s
  // return and `requestSchema` resolve them to. Without it (and depending
  // on property order) TS can fall back to K/Req's bare constraints here
  // instead of the specific types.
  call: (
    client: Client<S>,
    keys: readonly NoInfer<K>[],
    params: MessageInitShape<GenMessage<NoInfer<Req>>>,
    opts: CallOptions,
  ) => Promise<Res>;
  /** Extracts the entity list from the RPC response. */
  extractEntities: (res: Res) => readonly E[];
  /**
   * Extracts the matching key from an entity, used to match entities back
   * to requested keys.
   *
   * Callers should annotate `entity`'s type explicitly (e.g.
   * `(user: User) => user.id`, matching the entity produced by
   * `extractEntities`) rather than relying on inference — with the
   * `call`/`extractEntities`/`extractKey` triangle all sharing generics,
   * leaving this parameter unannotated can make TS fall back to `entity`'s
   * unconstrained type and, transitively, `call`'s `keys` to `RpcLoaderKey`
   * instead of the concrete key type.
   */
  extractKey: (entity: E) => K;
  /** `true` for a group loader (1 key -> N entities, missing -> `[]`). Defaults to an entity loader (missing -> `null`). */
  group?: Group;
  /**
   * Caps how many keys are sent in a single RPC call (passed through to
   * DataLoader's `maxBatchSize`). Unset or <= 0 means unlimited — a single
   * call carries every key collected in one DataLoader tick.
   */
  maxBatchSize?: number;
}

/** Accessor returned for entity-mode loaders (`group` unset or `false`). */
export type RpcLoaderAccessor<
  K extends RpcLoaderKey,
  E,
  Req extends Message,
> = (
  ctx: ProtoGraphqlConnectContext,
  params?: MessageInitShape<GenMessage<Req>>,
) => DataLoader<K, E | null>;

/** Accessor returned for group-mode loaders (`group: true`). */
export type GroupRpcLoaderAccessor<
  K extends RpcLoaderKey,
  E,
  Req extends Message,
> = (
  ctx: ProtoGraphqlConnectContext,
  params?: MessageInitShape<GenMessage<Req>>,
) => DataLoader<K, E[]>;

/**
 * Builds a loader accessor for a batch RPC: `(ctx, params?) => DataLoader`.
 *
 * The accessor maintains a two-level per-context cache (`ctx` -> `params`
 * key -> `DataLoader`), so concurrent `.load()` calls for the same `ctx`
 * and the same `params` (by value) merge into a single RPC call, while
 * different contexts or different params never share a batch.
 *
 * See docs/design/protoc-gen-dataloader/design.md §4.3 for the full
 * contract this implements (key-matching, params normalization, error
 * propagation).
 */
export function createRpcLoader<
  S extends GenService<GenServiceMethods>,
  K extends RpcLoaderKey,
  E,
  Req extends Message,
  Res,
  Group extends boolean = false,
>(
  config: CreateRpcLoaderConfig<S, K, E, Req, Res, Group>,
): Group extends true
  ? GroupRpcLoaderAccessor<K, E, Req>
  : RpcLoaderAccessor<K, E, Req> {
  // ctx -> paramsKey -> DataLoader. Two-level so concurrent load() calls for
  // the same ctx + params merge into one batch, while a different ctx or
  // different params never share a batch (design.md §4.3-1).
  const loadersByCtx = new WeakMap<
    object,
    Map<string, DataLoader<RpcLoaderKey, unknown>>
  >();

  const accessor = (
    ctx: ProtoGraphqlConnectContext,
    params?: Record<string, unknown>,
  ) => {
    const effectiveParams = params ?? {};
    const paramsKey = computeParamsKey(config.requestSchema, effectiveParams);

    let loadersByParamsKey = loadersByCtx.get(ctx);
    if (!loadersByParamsKey) {
      loadersByParamsKey = new Map();
      loadersByCtx.set(ctx, loadersByParamsKey);
    }

    let loader = loadersByParamsKey.get(paramsKey);
    if (!loader) {
      loader = new DataLoader<RpcLoaderKey, unknown>(
        (keys) => batchLoad(config, ctx, effectiveParams, keys),
        config.maxBatchSize && config.maxBatchSize > 0
          ? { maxBatchSize: config.maxBatchSize }
          : undefined,
      );
      loadersByParamsKey.set(paramsKey, loader);
    }
    return loader;
  };

  // The accessor's real shape is determined by the caller-visible
  // conditional return type above; this cast is the one place that
  // collapses it back to a concrete type for the implementation body.
  return accessor as Group extends true
    ? GroupRpcLoaderAccessor<K, E, Req>
    : RpcLoaderAccessor<K, E, Req>;
}

// `any` generics here are safe: this internal helper is only ever called
// with a config that was already checked against the public generics at
// createRpcLoader's call site.
async function batchLoad(
  config: CreateRpcLoaderConfig<any, any, any, any, any, boolean>,
  ctx: ProtoGraphqlConnectContext,
  params: Record<string, unknown>,
  keys: readonly RpcLoaderKey[],
): Promise<unknown[]> {
  const client = getClient(ctx, config.service);
  const callOptions = ctx.protoGraphql.callOptions?.(ctx) ?? {};
  // Intentionally not try/caught: a rejection here rejects DataLoader's
  // whole batch (every key in `keys`), which is the documented contract —
  // this package never translates RPC errors into per-key results.
  const res = await config.call(client, keys, params, callOptions);
  const entities = config.extractEntities(res);

  if (config.group) {
    const groups = new Map<RpcLoaderKey, unknown[]>();
    for (const entity of entities) {
      const key = config.extractKey(entity);
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(entity);
      } else {
        groups.set(key, [entity]);
      }
    }
    return keys.map((key) => groups.get(key) ?? []);
  }

  // Entity mode: last entity wins when the response contains duplicate keys.
  const byKey = new Map<RpcLoaderKey, unknown>();
  for (const entity of entities) {
    byKey.set(config.extractKey(entity), entity);
  }
  return keys.map((key) => byKey.get(key) ?? null);
}

/**
 * Derives a stable cache key for `params`: base64 of the binary encoding of
 * `create(requestSchema, params ?? {})`. Going through binary encoding
 * means bigint-valued params are handled for free, and `undefined` and `{}`
 * always normalize to the same key.
 */
// requestSchema/params are already type-erased at this internal boundary
// (see createRpcLoader / batchLoad above).
function computeParamsKey(
  requestSchema: GenMessage<any>,
  params: Record<string, unknown>,
): string {
  const message = create(requestSchema, params);
  const bytes = toBinary(requestSchema, message);
  return encodeBase64(bytes);
}

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// Dependency-free base64 encoding: the key is opaque and never decoded, so
// this avoids requiring Node's `Buffer` global (keeping the package usable
// outside Node, matching Connect-ES's own portability).
function encodeBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b0 = bytes[i];
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;
    const chunk = (b0 << 16) | (b1 << 8) | b2;
    out += BASE64_CHARS[(chunk >> 18) & 0x3f];
    out += BASE64_CHARS[(chunk >> 12) & 0x3f];
    out += hasB1 ? BASE64_CHARS[(chunk >> 6) & 0x3f] : "=";
    out += hasB2 ? BASE64_CHARS[chunk & 0x3f] : "=";
  }
  return out;
}
