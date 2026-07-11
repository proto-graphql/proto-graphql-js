import {
  type DescField,
  type DescMessage,
  type DescMethod,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";
import type { GraphqlRpcBatchOptions } from "../__generated__/extensions/graphql/schema_pb.js";
import { scalarMapLabelByType } from "./types.js";
import {
  getFederationKeyFieldsets,
  getRpcOptions,
  isRequiredField,
} from "./util.js";

/**
 * The TypeScript type a batch key maps to. Determined by the proto element
 * type of `key_field` (see design.md §4.4).
 */
export type BatchKeyTsType = "string" | "number" | "bigint";

/**
 * A validated batch-loader specification resolved from a single `DescMethod`
 * that declares `(graphql.rpc).batch`. Consumed by protoc-gen-dataloader (and
 * later by the protoc-gen-pothos federation wiring). See
 * docs/design/protoc-gen-dataloader/design.md §2〜§4.
 */
export interface BatchSpec {
  /** The RPC that declared `(graphql.rpc).batch`. */
  method: DescMethod;
  /** The repeated scalar key-list field on the request. */
  keyField: DescField;
  /** The repeated message entity-list field on the response. */
  entityField: DescField;
  /** The entity message type (element type of `entityField`). */
  entityMessage: DescMessage;
  /** The scalar key field on the entity, type-compatible with `keyField`. */
  entityKeyField: DescField;
  /** `true` for a group loader (1 key -> N entities). */
  group: boolean;
  /** DataLoader `maxBatchSize`; `undefined` when unset or 0 (unlimited). */
  maxBatchSize: number | undefined;
  /** The TypeScript key type derived from `keyField` (design.md §4.4). */
  keyTsType: BatchKeyTsType;
  /** Request fields other than `keyField`, exposed as loader params (§4.5). */
  paramFields: DescField[];
  /** `true` when any param field is required under input semantics (V9). */
  paramsRequired: boolean;
}

/**
 * The result of resolving a batch spec: either a validated {@link BatchSpec}
 * or a list of human-readable diagnostics. Callers surface `errors` verbatim
 * (e.g. as `CodeGeneratorResponse.error`).
 */
export type BatchSpecResult =
  | { ok: true; spec: BatchSpec }
  | { ok: false; errors: string[] };

/**
 * Resolves and validates the `(graphql.rpc).batch` declaration on `method`.
 *
 * Returns `null` when the method carries no `batch` option (not a batch
 * target). Otherwise returns a {@link BatchSpecResult}: `{ ok: true }` with a
 * fully-resolved spec, or `{ ok: false }` with diagnostics that name the
 * candidate fields and show a concrete option example (see design.md §3).
 */
export function resolveBatchSpec(method: DescMethod): BatchSpecResult | null {
  const batch = getRpcOptions(method).batch;
  if (batch == null) return null;

  const rpcRef = `${method.parent.name}.${method.name}`;

  // V1: batch is only meaningful on unary RPCs. Streaming has no single
  // request/response pair to derive keys/entities from, so this is a hard gate.
  if (method.methodKind !== "unary") {
    return {
      ok: false,
      errors: [
        `(graphql.rpc).batch on ${rpcRef} is only supported on unary RPCs, but ${rpcRef} is a ${method.methodKind} RPC. Remove the batch option or make the RPC unary.`,
      ],
    };
  }

  const errors: string[] = [];

  const keyRes = resolveKeyField(method, batch, rpcRef);
  if (!keyRes.ok) errors.push(...keyRes.errors);

  const entityRes = resolveEntityField(method, batch, rpcRef);
  if (!entityRes.ok) errors.push(...entityRes.errors);

  // entity_key resolution needs the entity message; only attempt it once the
  // entity is known. Type compatibility (V4) additionally needs the resolved
  // key, so pass it through when available.
  let entityKeyRes:
    | { ok: true; field: SingularScalarField }
    | { ok: false; errors: string[] }
    | undefined;
  if (entityRes.ok) {
    entityKeyRes = resolveEntityKey(
      batch,
      rpcRef,
      entityRes.message,
      keyRes.ok ? { field: keyRes.field, tsType: keyRes.tsType } : undefined,
    );
    if (!entityKeyRes.ok) errors.push(...entityKeyRes.errors);
  }

  if (errors.length > 0) return { ok: false, errors };

  // With no accumulated errors every step above succeeded; re-check to let the
  // type checker narrow the discriminated unions before building the spec.
  if (!keyRes.ok || !entityRes.ok || entityKeyRes == null || !entityKeyRes.ok) {
    return { ok: false, errors };
  }

  const keyField = keyRes.field;
  const paramFields = method.input.fields.filter((f) => f !== keyField);
  const paramsRequired = paramFields.some((f) => isRequiredField(f, "input"));

  return {
    ok: true,
    spec: {
      method,
      keyField,
      entityField: entityRes.field,
      entityMessage: entityRes.message,
      entityKeyField: entityKeyRes.field,
      group: batch.group,
      maxBatchSize: batch.maxBatchSize === 0 ? undefined : batch.maxBatchSize,
      keyTsType: keyRes.tsType,
      paramFields,
      paramsRequired,
    },
  };
}

type RepeatedScalarField = Extract<
  DescField,
  { fieldKind: "list"; listKind: "scalar" }
>;
type RepeatedMessageField = Extract<
  DescField,
  { fieldKind: "list"; listKind: "message" }
>;
type SingularScalarField = Extract<DescField, { fieldKind: "scalar" }>;

function isRepeatedScalarField(f: DescField): f is RepeatedScalarField {
  return f.fieldKind === "list" && f.listKind === "scalar";
}

function isRepeatedMessageField(f: DescField): f is RepeatedMessageField {
  return f.fieldKind === "list" && f.listKind === "message";
}

function isSingularScalarField(f: DescField): f is SingularScalarField {
  return f.fieldKind === "scalar";
}

// V2: resolve `key_field` (repeated scalar on request) + its TS key type.
function resolveKeyField(
  method: DescMethod,
  batch: GraphqlRpcBatchOptions,
  rpcRef: string,
):
  | { ok: true; field: RepeatedScalarField; tsType: BatchKeyTsType }
  | { ok: false; errors: string[] } {
  const request = method.input;
  const repeatedScalars = request.fields.filter(isRepeatedScalarField);
  const example = batchOptionExample([
    ["key_field", quote(repeatedScalars[0]?.name ?? "ids")],
  ]);

  let field: RepeatedScalarField;
  if (batch.keyField !== "") {
    const found = request.fields.find((f) => f.name === batch.keyField);
    if (found == null) {
      return err(
        `(graphql.rpc).batch.key_field on ${rpcRef} refers to "${batch.keyField}", but request message ${request.name} has no such field. Repeated scalar fields available: [${fieldNameList(repeatedScalars)}]. Example: ${example}`,
      );
    }
    if (!isRepeatedScalarField(found)) {
      return err(
        `(graphql.rpc).batch.key_field on ${rpcRef} must be a repeated scalar field, but "${found.name}" on ${request.name} is ${describeField(found)}. Repeated scalar fields available: [${fieldNameList(repeatedScalars)}]. Example: ${example}`,
      );
    }
    field = found;
  } else {
    const repeated = request.fields.filter((f) => f.fieldKind === "list");
    if (repeated.length === 0) {
      return err(
        `Cannot infer key_field for (graphql.rpc).batch on ${rpcRef}: request message ${request.name} has no repeated field to use as the batch key. Declare a repeated scalar field or set key_field explicitly. Example: ${example}`,
      );
    }
    if (repeated.length > 1) {
      return err(
        `Cannot infer key_field for (graphql.rpc).batch on ${rpcRef}: request message ${request.name} has multiple repeated fields ([${fieldNameList(repeated)}]). Set key_field explicitly to disambiguate. Example: ${example}`,
      );
    }
    const only = repeated[0];
    if (!isRepeatedScalarField(only)) {
      return err(
        `Cannot infer key_field for (graphql.rpc).batch on ${rpcRef}: the only repeated field "${only.name}" on ${request.name} is ${describeField(only)}, not a repeated scalar field. A batch key must be a repeated scalar field. Example: ${example}`,
      );
    }
    field = only;
  }

  // V4.4: map the proto element type to a TS key type.
  const tsType = keyTsTypeForScalar(field.scalar);
  if (tsType == null) {
    return err(
      `(graphql.rpc).batch.key_field "${field.name}" on ${request.name} has element type ${scalarMapLabelByType[field.scalar]}, which is not supported as a batch key. Supported key types: string; int32/uint32/sint32/fixed32/sfixed32 (number); int64/uint64/sint64/fixed64/sfixed64 (bigint).`,
    );
  }
  return { ok: true, field, tsType };
}

// V3: resolve `entity_field` (repeated message on response) + entity message.
function resolveEntityField(
  method: DescMethod,
  batch: GraphqlRpcBatchOptions,
  rpcRef: string,
):
  | { ok: true; field: RepeatedMessageField; message: DescMessage }
  | { ok: false; errors: string[] } {
  const response = method.output;
  const repeatedMessages = response.fields.filter(isRepeatedMessageField);
  const example = batchOptionExample([
    ["entity_field", quote(repeatedMessages[0]?.name ?? "entities")],
  ]);

  if (batch.entityField !== "") {
    const found = response.fields.find((f) => f.name === batch.entityField);
    if (found == null) {
      return err(
        `(graphql.rpc).batch.entity_field on ${rpcRef} refers to "${batch.entityField}", but response message ${response.name} has no such field. Repeated message fields available: [${fieldNameList(repeatedMessages)}]. Example: ${example}`,
      );
    }
    if (!isRepeatedMessageField(found)) {
      return err(
        `(graphql.rpc).batch.entity_field on ${rpcRef} must be a repeated message field, but "${found.name}" on ${response.name} is ${describeField(found)}. Repeated message fields available: [${fieldNameList(repeatedMessages)}]. Example: ${example}`,
      );
    }
    return { ok: true, field: found, message: found.message };
  }

  if (repeatedMessages.length === 0) {
    return err(
      `Cannot infer entity_field for (graphql.rpc).batch on ${rpcRef}: response message ${response.name} has no repeated message field. Declare one or set entity_field explicitly. Example: ${example}`,
    );
  }
  if (repeatedMessages.length > 1) {
    return err(
      `Cannot infer entity_field for (graphql.rpc).batch on ${rpcRef}: response message ${response.name} has multiple repeated message fields ([${fieldNameList(repeatedMessages)}]). Set entity_field explicitly. Example: ${example}`,
    );
  }
  const field = repeatedMessages[0];
  return { ok: true, field, message: field.message };
}

// V4/V5/V6/V7: resolve `entity_key` (scalar on entity), including the
// single-field `@key` fallback and key type-compatibility check.
function resolveEntityKey(
  batch: GraphqlRpcBatchOptions,
  rpcRef: string,
  entityMessage: DescMessage,
  key: { field: RepeatedScalarField; tsType: BatchKeyTsType } | undefined,
): { ok: true; field: SingularScalarField } | { ok: false; errors: string[] } {
  const scalarFields = entityMessage.fields.filter(isSingularScalarField);
  const example = batch.group
    ? batchOptionExample([
        ["group", "true"],
        ["entity_key", quote(scalarFields[0]?.name ?? "id")],
      ])
    : batchOptionExample([
        ["entity_key", quote(scalarFields[0]?.name ?? "id")],
      ]);

  let name: string;
  if (batch.entityKey !== "") {
    name = batch.entityKey;
  } else if (batch.group) {
    // V6: the parent key is not the entity's own @key, so it cannot be inferred.
    return err(
      `(graphql.rpc).batch on ${rpcRef} is a group loader (group: true) and requires an explicit entity_key, because the grouping key is not the entity's own @key. Scalar fields on ${entityMessage.name}: [${fieldNameList(scalarFields)}]. Example: ${example}`,
    );
  } else {
    // V5: fall back to a single-field `(graphql.object_type).federation.key`.
    const fieldsets = getFederationKeyFieldsets(entityMessage);
    if (fieldsets.length === 0) {
      return err(
        `Cannot infer entity_key for (graphql.rpc).batch on ${rpcRef}: entity message ${entityMessage.name} has no (graphql.object_type).federation.key to fall back to. Set entity_key explicitly. Scalar fields on ${entityMessage.name}: [${fieldNameList(scalarFields)}]. Example: ${example}`,
      );
    }
    if (fieldsets.length > 1) {
      return err(
        `Cannot infer entity_key for (graphql.rpc).batch on ${rpcRef}: entity message ${entityMessage.name} declares multiple federation key sets ([${fieldsets.map(quote).join(", ")}]). Set entity_key explicitly. Scalar fields on ${entityMessage.name}: [${fieldNameList(scalarFields)}]. Example: ${example}`,
      );
    }
    const parts = fieldsets[0]
      .trim()
      .split(/\s+/)
      .filter((p) => p !== "");
    if (parts.length !== 1) {
      // V7: composite keys (a fieldset with multiple fields) are unsupported.
      return err(
        `Cannot infer entity_key for (graphql.rpc).batch on ${rpcRef}: the federation key "${fieldsets[0]}" on ${entityMessage.name} is a composite key (${parts.length} fields), which is not supported in this version. Only single-field keys are supported; set a single-field entity_key explicitly. Example: ${example}`,
      );
    }
    name = parts[0];
  }

  const found = entityMessage.fields.find((f) => f.name === name);
  if (found == null) {
    return err(
      `(graphql.rpc).batch.entity_key on ${rpcRef} refers to "${name}", but entity message ${entityMessage.name} has no such field. Scalar fields available: [${fieldNameList(scalarFields)}]. Example: ${example}`,
    );
  }
  if (!isSingularScalarField(found)) {
    return err(
      `(graphql.rpc).batch.entity_key on ${rpcRef} must be a singular scalar field, but "${found.name}" on ${entityMessage.name} is ${describeField(found)}. Scalar fields available: [${fieldNameList(scalarFields)}]. Example: ${example}`,
    );
  }

  // V4: the entity key must map to the same TS key type as `key_field`.
  if (key != null) {
    const entityTsType = keyTsTypeForScalar(found.scalar);
    if (entityTsType == null || entityTsType !== key.tsType) {
      return err(
        `(graphql.rpc).batch.entity_key "${found.name}" on ${entityMessage.name} has type ${scalarMapLabelByType[found.scalar]} (${entityTsType ?? "unsupported as a key"}), which is not compatible with key_field "${key.field.name}" of type ${scalarMapLabelByType[key.field.scalar]} (${key.tsType}). The batch key and entity key must map to the same TypeScript key type.`,
      );
    }
  }

  return { ok: true, field: found };
}

function keyTsTypeForScalar(scalar: ProtoScalarType): BatchKeyTsType | null {
  switch (scalar) {
    case ProtoScalarType.STRING:
      return "string";
    case ProtoScalarType.INT32:
    case ProtoScalarType.UINT32:
    case ProtoScalarType.SINT32:
    case ProtoScalarType.FIXED32:
    case ProtoScalarType.SFIXED32:
      return "number";
    case ProtoScalarType.INT64:
    case ProtoScalarType.UINT64:
    case ProtoScalarType.SINT64:
    case ProtoScalarType.FIXED64:
    case ProtoScalarType.SFIXED64:
      return "bigint";
    default:
      // bool / bytes / float / double are scalars but unsupported as keys.
      // enum / message never reach here (they are not scalar fields).
      return null;
  }
}

function describeField(f: DescField): string {
  switch (f.fieldKind) {
    case "list":
      return `a repeated ${f.listKind} field`;
    case "map":
      return "a map field";
    case "message":
      return "a singular message field";
    case "enum":
      return "a singular enum field";
    case "scalar":
      return "a singular scalar field";
    default: {
      const _exhaustive: never = f;
      return "an unknown field";
    }
  }
}

function fieldNameList(fields: readonly DescField[]): string {
  if (fields.length === 0) return "none";
  return fields.map((f) => quote(f.name)).join(", ");
}

function quote(s: string): string {
  return `"${s}"`;
}

function batchOptionExample(entries: Array<[string, string]>): string {
  const body = entries.map(([k, v]) => `${k}: ${v}`).join(", ");
  return `option (graphql.rpc).batch = { ${body} };`;
}

function err(message: string): { ok: false; errors: string[] } {
  return { ok: false, errors: [message] };
}
