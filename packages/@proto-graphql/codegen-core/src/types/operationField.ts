import type { DescFile, DescMethod, DescService } from "@bufbuild/protobuf";
import { MethodOptions_IdempotencyLevel } from "@bufbuild/protobuf/wkt";
import { camelCase } from "change-case";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import { isMessageField } from "../proto/util.js";
import type { EnumType } from "./EnumType.js";
import type { InputObjectField } from "./InputObjectField.js";
import { InputObjectType } from "./InputObjectType.js";
import type { InterfaceType } from "./InterfaceType.js";
import { ObjectField } from "./ObjectField.js";
import { ObjectType } from "./ObjectType.js";
import type { TypeOptions } from "./options.js";
import type { ScalarType } from "./ScalarType.js";
import type { SquashedOneofUnionType } from "./SquashedOneofUnionType.js";
import { getObjectFieldType } from "./types.js";
import {
  exceptRequestOrResponse,
  getRpcOptions,
  getServiceOptions,
  isIgnoredInputType,
  isIgnoredType,
  isInterface,
  isServiceOptedIn,
  isSquashedUnion,
} from "./util.js";

const EMPTY_TYPE_NAME = "google.protobuf.Empty";

/** Whether the RPC maps to a GraphQL `Query` or `Mutation` field (R2). */
export type OperationKind = "query" | "mutation";

/**
 * The GraphQL argument model for an operation.
 *
 * - `none` — the request is `google.protobuf.Empty`, so the field takes no
 *   arguments (R5.5), regardless of {@link OperationKind}.
 * - `flatten` — a Query flattens each request field into its own argument
 *   (R4.1). The arguments are the request message's {@link InputObjectField}s,
 *   reusing the existing input-field machinery verbatim: nullability via
 *   `isRequiredField(field, "input")`, behavior comments (`Input only.` fields
 *   are already dropped by `InputObjectType.fields`), message-typed fields
 *   referencing the message's Input type, and scalars/enums via `detectType` /
 *   `scalarMapping`.
 *
 *   oneof members are flattened into individual arguments (each oneof member is
 *   a plain field on the request message). v1 intentionally emits **no runtime
 *   XOR validation** for mutually exclusive oneof members — this is the open
 *   item in decision-log §5; flattened arguments only. The printer is expected
 *   to reuse the same input-field rendering it uses for `InputObjectType`.
 * - `input` — a Mutation takes a single `input` argument referencing the
 *   request message's {@link InputObjectType} (R4.2).
 */
export type OperationArgs =
  | { readonly kind: "none" }
  | {
      readonly kind: "flatten";
      readonly args: readonly InputObjectField<
        ScalarType | EnumType | InputObjectType
      >[];
    }
  | { readonly kind: "input"; readonly type: InputObjectType };

/**
 * The GraphQL return model for an operation.
 *
 * - `object` — the response message's {@link ObjectType} (R5.3), structure
 *   preserved.
 * - `exposeField` — `(graphql.rpc).expose_field` unwraps a single response
 *   field; the return becomes that field's type (R5.4). The {@link ObjectField}
 *   carries the field's type, list-ness and output nullability.
 * - `boolean` — the response is `google.protobuf.Empty`, mapped to a non-null
 *   `Boolean` that the printer emits as a literal always-`true` resolver
 *   (R5.5).
 */
export type OperationReturnType =
  | { readonly kind: "object"; readonly type: ObjectType }
  | {
      readonly kind: "exposeField";
      readonly field: ObjectField<
        | ScalarType
        | EnumType
        | ObjectType
        | InterfaceType
        | SquashedOneofUnionType
      >;
    }
  | { readonly kind: "boolean" };

/**
 * A resolved, printable model of one opted-in unary RPC as a GraphQL Query or
 * Mutation field. Produced by {@link collectOperationsFromFile}; consumed by
 * the protoc-gen-pothos operation printer (T1.3).
 */
export interface OperationField {
  readonly kind: OperationKind;
  /** GraphQL field name: `camelCase(rpc name)`, overridable by `(graphql.rpc).name` (R3). */
  readonly name: string;
  readonly method: DescMethod;
  readonly service: DescService;
  readonly args: OperationArgs;
  readonly returnType: OperationReturnType;
  /**
   * Nullability of the field's return.
   *
   * Judgment call (flagged in the T1.2 report): a response-message return is
   * **non-null by default** — the RPC either returns a value or throws, and
   * `NOT_FOUND` is surfaced as an error rather than `null` (decision-log Q12).
   * An `expose_field` return follows that field's own output nullability
   * (`isRequiredField(field, "output")`). An `Empty` → `Boolean` return is
   * non-null (always `true`).
   */
  readonly nullable: boolean;
  readonly deprecationReason: string | null;
}

/**
 * The result of collecting operations from a file.
 *
 * `warnings` and `errors` are returned as plain strings (keeping codegen-core
 * IO-free): the plugin decides how to surface them — `warnings` to stderr,
 * a non-empty `errors` fails generation (e.g. as `CodeGeneratorResponse.error`).
 */
export interface OperationCollectionResult {
  readonly operations: OperationField[];
  readonly warnings: string[];
  readonly errors: string[];
}

/**
 * Cheap predicate for the plugin's `protobuf_lib=protobuf-es` guard (R1.4):
 * `true` iff the file contains at least one service carrying `(graphql.service)`
 * (presence, ignoring `service.ignore`). The plugin uses this to decide whether
 * to error when the runtime is not protobuf-es, *before* running collection.
 */
export function fileHasOptedInServices(file: DescFile): boolean {
  return file.services.some(isServiceOptedIn);
}

/**
 * Resolves opted-in services' unary RPCs in `file` into printable
 * {@link OperationField} models.
 *
 * Selection (R1): only services with a present `(graphql.service)` option are
 * considered; a service with `ignore = true` is skipped entirely (stays opted
 * in conceptually). Per-RPC `(graphql.rpc).ignore` skips that RPC. Streaming
 * (non-unary) RPCs are skipped with a warning, or produce an error when they
 * explicitly set `operation`.
 *
 * `files` is the full set of files in the run (e.g. `schema.allFiles`), needed
 * to decide whether a request's Input / response's Object type is generated
 * (it participates in the memoized `ignore_requests` / `ignore_responses`
 * predicate).
 *
 * Field-name collisions across RPCs (two RPCs resolving to the same Query or
 * Mutation field name) are intentionally **out of scope**: Pothos raises a
 * clear error at schema build time, and detecting it here would need a
 * cross-file, cross-service index this per-file collector does not own.
 */
export function collectOperationsFromFile(
  file: DescFile,
  options: TypeOptions,
  files: readonly DescFile[],
): OperationCollectionResult {
  const operations: OperationField[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const service of file.services) {
    if (!isServiceOptedIn(service)) continue;
    if (getServiceOptions(service).ignore) continue;

    for (const method of service.methods) {
      const rpcOpts = getRpcOptions(method);
      if (rpcOpts.ignore) continue;

      const rpcRef = `${service.name}.${method.name}`;

      // R1.3: streaming RPCs have no single request/response pair to map, so
      // they are skipped. An explicit `operation` on a streaming RPC is a
      // contradiction (it asks for a mapping that cannot exist) -> error.
      if (method.methodKind !== "unary") {
        if (hasExplicitOperation(rpcOpts)) {
          errors.push(
            `(graphql.rpc).operation is set on ${rpcRef}, but ${rpcRef} is a ${method.methodKind} RPC. Streaming RPCs cannot be mapped to a GraphQL Query/Mutation. Remove the operation option, or set (graphql.rpc).ignore = true to exclude this RPC.`,
          );
        } else {
          warnings.push(
            `Skipping ${rpcRef}: ${method.methodKind} (streaming) RPCs are not supported and will not be generated as GraphQL operations. Set (graphql.rpc).ignore = true on this RPC to silence this warning.`,
          );
        }
        continue;
      }

      const result = resolveOperation(method, rpcOpts, options, files);
      if (!result.ok) {
        errors.push(...result.errors);
        continue;
      }
      operations.push(result.operation);
    }
  }

  return { operations, warnings, errors };
}

function hasExplicitOperation(rpcOpts: extensions.GraphqlRpcOptions): boolean {
  return (
    rpcOpts.operation !==
    extensions.GraphqlOperation.GRAPHQL_OPERATION_UNSPECIFIED
  );
}

type OperationResult =
  | { ok: true; operation: OperationField }
  | { ok: false; errors: string[] };

function resolveOperation(
  method: DescMethod,
  rpcOpts: extensions.GraphqlRpcOptions,
  options: TypeOptions,
  files: readonly DescFile[],
): OperationResult {
  const kind = resolveOperationKind(method, rpcOpts);

  const errors: string[] = [];
  const argsRes = resolveArgs(method, kind, options, files);
  if (!argsRes.ok) errors.push(...argsRes.errors);
  const returnRes = resolveReturn(method, rpcOpts, options, files);
  if (!returnRes.ok) errors.push(...returnRes.errors);

  if (!argsRes.ok || !returnRes.ok) return { ok: false, errors };

  return {
    ok: true,
    operation: {
      kind,
      name: rpcOpts.name !== "" ? rpcOpts.name : camelCase(method.name),
      method,
      service: method.parent,
      args: argsRes.args,
      returnType: returnRes.returnType,
      nullable: returnRes.nullable,
      // `getDeprecationReason` does not accept a `DescMethod` (its exhaustive
      // switch has no `rpc` case), so mirror its field/oneof phrasing here.
      deprecationReason: method.deprecated
        ? `${method.parent.typeName}.${method.name} is mark as deprecated in a *.proto file.`
        : null,
    },
  };
}

// R2: explicit `operation` wins; otherwise NO_SIDE_EFFECTS -> Query, else Mutation.
function resolveOperationKind(
  method: DescMethod,
  rpcOpts: extensions.GraphqlRpcOptions,
): OperationKind {
  switch (rpcOpts.operation) {
    case extensions.GraphqlOperation.QUERY:
      return "query";
    case extensions.GraphqlOperation.MUTATION:
      return "mutation";
    default:
      return method.idempotency ===
        MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS
        ? "query"
        : "mutation";
  }
}

type ArgsResult =
  | { ok: true; args: OperationArgs }
  | { ok: false; errors: string[] };

function resolveArgs(
  method: DescMethod,
  kind: OperationKind,
  options: TypeOptions,
  files: readonly DescFile[],
): ArgsResult {
  // R5.5: an Empty request means zero arguments, for both Query and Mutation.
  if (method.input.typeName === EMPTY_TYPE_NAME) {
    return { ok: true, args: { kind: "none" } };
  }

  if (kind === "query") {
    // R4.1: flatten the request into arguments. Reuse InputObjectType so the
    // arguments inherit input-field semantics (nullability, Input-only drop,
    // message->Input references, scalar/enum detection) with zero divergence.
    const fields = new InputObjectType(method.input, options).fields;

    // A flattened Query does not need the request's *own* Input type, but a
    // message-typed argument still references its field message's Input type;
    // if that is ignored, the argument cannot be typed.
    const errors: string[] = [];
    for (const arg of fields) {
      if (!(arg.type instanceof InputObjectType)) continue;
      if (!isMessageField(arg.proto)) continue;
      if (isIgnoredInputType(arg.proto.message)) {
        errors.push(
          `Cannot generate a query argument for ${rpcRefOf(method)}: field "${arg.proto.name}" references message ${arg.proto.message.typeName}, whose Input type is not generated (ignored via (graphql.input_type).ignore or the file's ignore_requests). Remove the ignore option so an Input type is generated, or set (graphql.rpc).ignore = true on this RPC.`,
        );
      }
    }
    if (errors.length > 0) return { ok: false, errors };
    return { ok: true, args: { kind: "flatten", args: fields } };
  }

  // R4.2: Mutation takes a single `input` argument referencing the request's
  // Input type, which must therefore be generated.
  if (!isInputTypeGenerated(method.input, files)) {
    return {
      ok: false,
      errors: [
        `Cannot generate a mutation for ${rpcRefOf(method)}: its request message ${method.input.typeName} has no generated Input type (ignored via (graphql.input_type).ignore or the file's ignore_requests). Enable (graphql.schema).requests_as_inputs, or remove the ignore option so an Input type is generated.`,
      ],
    };
  }
  return {
    ok: true,
    args: { kind: "input", type: new InputObjectType(method.input, options) },
  };
}

type ReturnResult =
  | { ok: true; returnType: OperationReturnType; nullable: boolean }
  | { ok: false; errors: string[] };

function resolveReturn(
  method: DescMethod,
  rpcOpts: extensions.GraphqlRpcOptions,
  options: TypeOptions,
  files: readonly DescFile[],
): ReturnResult {
  // R5.4: explicit `expose_field` takes precedence over the default return.
  if (rpcOpts.exposeField !== "") {
    const proto = method.output.fields.find(
      (f) => f.name === rpcOpts.exposeField,
    );
    if (proto == null) {
      return {
        ok: false,
        errors: [
          `(graphql.rpc).expose_field on ${rpcRefOf(method)} refers to "${rpcOpts.exposeField}", but response message ${method.output.typeName} has no such field. Available fields: [${availableFieldNames(method)}]. Set expose_field to one of these, or remove it to return the whole response.`,
        ],
      };
    }
    const field = new ObjectField(
      getObjectFieldType(proto, options),
      new ObjectType(method.output, options),
      proto,
    );
    return {
      ok: true,
      returnType: { kind: "exposeField", field },
      nullable: field.isNullable(),
    };
  }

  // R5.5: an Empty response maps to a non-null Boolean (always true).
  if (method.output.typeName === EMPTY_TYPE_NAME) {
    return { ok: true, returnType: { kind: "boolean" }, nullable: false };
  }

  // R5.3: default return is the response message's Object type, which must be
  // generated. NON_NULL by default (decision-log Q12 — the RPC returns or
  // throws; NOT_FOUND is an error, not null).
  if (!isObjectTypeGenerated(method.output, files)) {
    return {
      ok: false,
      errors: [
        `Cannot determine the return type for ${rpcRefOf(method)}: its response message ${method.output.typeName} has no generated Object type (ignored via (graphql.object_type).ignore or the file's ignore_responses) and no (graphql.rpc).expose_field is set. Enable (graphql.schema).responses_as_payloads, set (graphql.rpc).expose_field to a response field, or remove the ignore option.`,
      ],
    };
  }
  return {
    ok: true,
    returnType: {
      kind: "object",
      type: new ObjectType(method.output, options),
    },
    nullable: false,
  };
}

// Mirrors `buildInputObjectTypes`' filter: an Input type is generated unless
// the message is ignored as an input, or filtered out by `ignore_requests`.
function isInputTypeGenerated(
  msg: DescMethod["input"],
  files: readonly DescFile[],
): boolean {
  return !isIgnoredInputType(msg) && exceptRequestOrResponse(files)(msg);
}

// Mirrors `buildObjectTypes`' filter: an Object type is generated unless the
// message is ignored, an interface, a squashed union, or filtered out by
// `ignore_responses`.
function isObjectTypeGenerated(
  msg: DescMethod["output"],
  files: readonly DescFile[],
): boolean {
  return (
    !isIgnoredType(msg) &&
    !isInterface(msg) &&
    !isSquashedUnion(msg) &&
    exceptRequestOrResponse(files)(msg)
  );
}

function rpcRefOf(method: DescMethod): string {
  return `${method.parent.name}.${method.name}`;
}

function availableFieldNames(method: DescMethod): string {
  const names = method.output.fields.map((f) => `"${f.name}"`);
  return names.length === 0 ? "none" : names.join(", ");
}
