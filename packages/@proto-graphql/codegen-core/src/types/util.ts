import {
  create,
  type DescEnum,
  type DescEnumValue,
  type DescField,
  type DescFile,
  type DescMessage,
  type DescMethod,
  type DescOneof,
  type DescService,
  getExtension,
  hasExtension,
} from "@bufbuild/protobuf";
import {
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
} from "@bufbuild/protobuf/wkt";
import { pascalCase } from "change-case";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import { type CommentedDesc, getCommentsFor } from "../proto/comments.js";
import {
  isEnumField,
  isMapField,
  isMessageField,
  isScalarField,
} from "../proto/util.js";

const EMPTY_FILES: readonly DescFile[] = [];

/**
 * @param files All files in the run, used to resolve the
 * `requests_as_inputs` / `responses_as_payloads` suffix transform (see
 * {@link resolveSuffixTransform}). Defaults to no files, i.e. no transform —
 * safe for callers that don't carry a `files` array (e.g. a hand-built
 * `TypeOptions` with no `files` set).
 */
export function gqlTypeName(
  typ: DescMessage | DescOneof | DescEnum,
  files: readonly DescFile[] = EMPTY_FILES,
): string {
  return nameWithParent(typ, files);
}

function nameWithParent(
  typ: DescMessage | DescOneof | DescEnum,
  files: readonly DescFile[],
): string {
  let name = "";
  let t: DescMessage | DescOneof | DescEnum | undefined = typ;
  for (;;) {
    if (t == null) break;
    let override: string | undefined;
    if (t.kind === "message") {
      // Precedence: an explicit `(graphql.object_type).name` override always
      // wins over the requests_as_inputs/responses_as_payloads suffix
      // transform (design.md §2/§7). Falling through to the transform here —
      // rather than special-casing in `InputObjectType`/`ObjectType` — is what
      // makes the rename visible to every reference (fields, operation
      // args/returns, nested descendants), since they all resolve names
      // through this single function.
      override =
        getObjectTypeOptions(t).name ||
        resolveSuffixTransform(t, files)?.nameSegment;
    }
    if (t.kind === "enum") {
      override = getEnumTypeOptions(t).name;
    }
    name = `${
      t.kind === "oneof" ? pascalCase(t.name) : override || t.name
    }${name}`;
    t = t.parent;
  }
  const prefix = getSchemaOptions(
    typ.kind === "oneof" ? typ.parent : typ,
  )?.typePrefix;
  if (prefix) {
    name = `${prefix}${name}`;
  }
  return name;
}

export function getDeprecationReason(
  proto:
    | DescFile
    | DescMessage
    | DescOneof
    | DescField
    | DescEnum
    | DescEnumValue,
): string | null {
  const reason = getDeprecationReasonType(proto);
  if (!reason) return null;

  switch (reason.kind) {
    case "file": {
      return `${reason.name}.proto is mark as deprecated.`;
    }
    case "message":
    case "enum": {
      return `${reason.typeName} is mark as deprecated in a *.proto file.`;
    }
    case "field":
    case "oneof":
    case "enum_value": {
      return `${reason.parent.typeName}.${reason.name} is mark as deprecated in a *.proto file.`;
    }
    default: {
      reason satisfies never;
      throw "unreachable";
    }
  }
}

function getDeprecationReasonType(
  desc:
    | DescFile
    | DescMessage
    | DescOneof
    | DescField
    | DescEnum
    | DescEnumValue,
):
  | DescFile
  | DescMessage
  | DescOneof
  | DescField
  | DescEnum
  | DescEnumValue
  | null {
  if (desc.deprecated) return desc;
  switch (desc.kind) {
    case "file": {
      return null;
    }
    case "field": {
      if (isMessageField(desc)) {
        return (
          getDeprecationReasonType(desc.message) ||
          getDeprecationReasonType(desc.parent)
        );
      }
      if (isEnumField(desc)) {
        return (
          getDeprecationReasonType(desc.enum) ||
          getDeprecationReasonType(desc.parent)
        );
      }
      if (isScalarField(desc) || isMapField(desc)) {
        return getDeprecationReasonType(desc.parent);
      }
      desc satisfies never;
      throw "unreachable";
    }
    case "oneof": {
      if (desc.fields.every((f) => f.deprecated)) return desc;
      return getDeprecationReasonType(desc.parent);
    }
    case "enum_value":
      return getDeprecationReasonType(desc.parent);

    case "message":
    case "enum": {
      return getDeprecationReasonType(desc.parent ?? desc.file);
    }
    default: {
      desc satisfies never;
      throw "unreachable";
    }
  }
}

// Shared classification of "is this message the exact-match request/response
// of some method" (R5.1/R5.2's matching rule, same rule `exceptRequestOrResponse`
// has always used): a message is a request iff some method's input is
// *named* `${method.name}Request` and resolves to it (ditto response /
// `${method.name}Response`). Built once per `files` array and reused by
// `exceptRequestOrResponse` (ignore_requests/ignore_responses) and
// `resolveSuffixTransform` (requests_as_inputs/responses_as_payloads) below,
// so the two options share one matching rule instead of two copies of it.
//
// `exceptRequestOrResponse` is called three times per file (the object, input,
// and interface builders), and `collectTypesFromFile` runs once per generated
// file with `schema.allFiles` — so the request/response set scan ran
// files²·3 times on large schemas (the set-building loop was ~22% of self time
// on a 538-file schema). The sets depend only on the `files` array, which is a
// stable reference for the whole run, so memoize by it and build them once.
interface RequestResponseSets {
  readonly reqSet: ReadonlySet<string>;
  readonly respSet: ReadonlySet<string>;
}

const requestResponseSetsCache = new WeakMap<
  readonly DescFile[],
  RequestResponseSets
>();

function getRequestResponseSets(
  files: readonly DescFile[],
): RequestResponseSets {
  const cached = requestResponseSetsCache.get(files);
  if (cached !== undefined) return cached;

  const reqSet = new Set<string>();
  const respSet = new Set<string>();
  for (const f of files) {
    for (const s of f.services) {
      for (const m of s.methods) {
        if (m.input.name === `${m.name}Request`) {
          reqSet.add(m.input.typeName);
        }
        if (m.output.name === `${m.name}Response`) {
          respSet.add(m.output.typeName);
        }
      }
    }
  }

  const sets: RequestResponseSets = { reqSet, respSet };
  requestResponseSetsCache.set(files, sets);
  return sets;
}

function isRequestMessage(m: DescMessage, files: readonly DescFile[]): boolean {
  return getRequestResponseSets(files).reqSet.has(m.typeName);
}

function isResponseMessage(
  m: DescMessage,
  files: readonly DescFile[],
): boolean {
  return getRequestResponseSets(files).respSet.has(m.typeName);
}

// The predicate itself (not just the sets) is memoized separately: it depends
// only on the `files` array too, so build it exactly once per array.
const reqRespPredicateCache = new WeakMap<
  readonly DescFile[],
  (m: DescMessage) => boolean
>();

export function exceptRequestOrResponse(
  files: readonly DescFile[],
): (m: DescMessage) => boolean {
  const cached = reqRespPredicateCache.get(files);
  if (cached !== undefined) return cached;

  const predicate = (m: DescMessage): boolean => {
    const ext = getSchemaOptions(m);

    if (ext.ignoreRequests && isRequestMessage(m, files)) return false;
    if (ext.ignoreResponses && isResponseMessage(m, files)) return false;

    return true;
  };
  reqRespPredicateCache.set(files, predicate);
  return predicate;
}

// ---- requests_as_inputs / responses_as_payloads (R5.1/R5.2) ----
//
// Suffix-transform naming + generation filtering for the file-level
// `GraphqlSchemaOptions.requests_as_inputs` / `.responses_as_payloads`
// options (design.md §2/§7, decision-log Q10/Q11).
//
// Precedence (schema.proto doc comments, design.md §7): `ignore_requests` /
// `ignore_responses` win over the corresponding suffix-transform option on the
// *same* message — `resolveSuffixTransform` returns `null` in that case, so
// the message is neither renamed nor exempted from `exceptRequestOrResponse`'s
// drop; it is simply dropped, same as today. This precedence is silent at this
// layer (type collection has no warning channel) — `collectOperationsFromFile`
// surfaces a once-per-file warning when it sees the combination on a file's
// options, since it already reads `GraphqlSchemaOptions` per file.
interface SuffixTransform {
  readonly kind: "request" | "response";
  /**
   * The name segment `nameWithParent` substitutes for this message's own
   * `t.name` in its ancestor-walk.
   *
   * - `request`: the *bare* base name (`Request` suffix stripped, e.g.
   *   `CreateUser`). `InputObjectType.typeName` appends `Input` on top of
   *   `gqlTypeName`, so returning the bare name here — rather than the fully
   *   suffixed `Input` name — is what keeps `CreateUserRequest` ->
   *   `CreateUserInput` instead of `CreateUserInputInput`. This was chosen
   *   over special-casing inside `InputObjectType.typeName` because it keeps
   *   the transform entirely inside the shared naming function; every other
   *   caller of `gqlTypeName` for this message (there are none once
   *   requests_as_inputs excludes it from Object/Interface building) would
   *   otherwise need its own special case too.
   * - `response`: the *full* final name (`Response` suffix replaced with
   *   `Payload`, e.g. `CreateUserPayload`). `ObjectType.typeName` uses
   *   `gqlTypeName` directly with no further suffixing, so the replacement
   *   must already be the complete name.
   */
  readonly nameSegment: string;
}

// Memoized per-message: `nameWithParent` reads this once per message-kind
// ancestor per `.typeName` access (i.e. frequently), and the collision check
// triggered below must only run once per message (see the comment at the
// `.set` call).
const suffixTransformCache = new WeakMap<DescMessage, SuffixTransform | null>();

function resolveSuffixTransform(
  m: DescMessage,
  files: readonly DescFile[],
): SuffixTransform | null {
  const cached = suffixTransformCache.get(m);
  if (cached !== undefined) return cached;

  const ext = getSchemaOptions(m);
  let transform: SuffixTransform | null = null;
  if (
    ext.requestsAsInputs &&
    !ext.ignoreRequests &&
    isRequestMessage(m, files)
  ) {
    transform = {
      kind: "request",
      nameSegment: m.name.replace(/Request$/, ""),
    };
  } else if (
    ext.responsesAsPayloads &&
    !ext.ignoreResponses &&
    isResponseMessage(m, files)
  ) {
    transform = {
      kind: "response",
      nameSegment: m.name.replace(/Response$/, "Payload"),
    };
  }

  // Set the cache *before* running the collision check: the check computes
  // `gqlTypeName` for sibling messages in the same file, which is safe (no
  // cycle: siblings are distinct messages, and this function only recurses on
  // `m` itself through the cache, which is now populated). Setting it early
  // also turns every subsequent `.typeName` access of this message into an
  // O(1) cache read instead of re-running the collision scan.
  suffixTransformCache.set(m, transform);
  if (transform != null) checkSuffixTransformCollision(m, transform, files);
  return transform;
}

/**
 * `requests_as_inputs`: `m` generates only its Input type (renamed
 * `XxxRequest` -> `XxxInput`), so it must be excluded from Object/Interface
 * building (types.ts `buildObjectTypes`/`buildInterfaceType`,
 * operationField.ts `isObjectTypeGenerated`).
 */
export function isRequestAsInputOnly(
  m: DescMessage,
  files: readonly DescFile[],
): boolean {
  return resolveSuffixTransform(m, files)?.kind === "request";
}

/**
 * `responses_as_payloads`: `m` generates only its Object type (renamed
 * `XxxResponse` -> `XxxPayload`), so it must be excluded from Input/partial
 * Input building (types.ts `buildInputObjectTypes`, operationField.ts
 * `isInputTypeGenerated`).
 */
export function isResponseAsPayloadOnly(
  m: DescMessage,
  files: readonly DescFile[],
): boolean {
  return resolveSuffixTransform(m, files)?.kind === "response";
}

// Collision guard (design.md §7): a suffix-transformed name must not collide
// with another type this file already generates under that exact GraphQL
// name (Object/Input/Enum/Union/Interface types all share one GraphQL type
// namespace). There is no precedent for a hard failure in the type-collection
// layer (the only other `throw`s here are for genuinely unsupported input,
// e.g. `types.ts`'s "map type is not supported"), so this follows that
// precedent: throw a descriptive `Error` straight from the naming path.
//
// Scoped to the message's own file and to *top-level* messages/enums (nested
// types are not exhaustively checked): request/response messages are
// virtually always top-level in practice, and this keeps the check
// O(top-level types in one file) instead of requiring a full recursive walk
// mirroring `collectDescsRecursively` on every transform.
function checkSuffixTransformCollision(
  m: DescMessage,
  transform: SuffixTransform,
  files: readonly DescFile[],
): void {
  const finalName =
    transform.kind === "request"
      ? `${gqlTypeName(m, files)}Input`
      : gqlTypeName(m, files);

  const fail = (otherTypeName: string): never => {
    const optionName =
      transform.kind === "request"
        ? "requests_as_inputs"
        : "responses_as_payloads";
    throw new Error(
      `(graphql.schema).${optionName} renames "${m.typeName}" to the GraphQL type "${finalName}", ` +
        `which collides with a type already generated from "${otherTypeName}" in ${m.file.name}. ` +
        "Rename one of them (e.g. via (graphql.object_type).name / (graphql.enum_type).name) to resolve the collision.",
    );
  };

  for (const other of m.file.messages) {
    if (other === m) continue;
    const otherName = gqlTypeName(other, files);
    if (
      !isIgnoredType(other) &&
      !isRequestAsInputOnly(other, files) &&
      otherName === finalName
    ) {
      fail(other.typeName);
    }
    if (
      !isIgnoredInputType(other) &&
      !isResponseAsPayloadOnly(other, files) &&
      `${otherName}Input` === finalName
    ) {
      fail(other.typeName);
    }
  }
  for (const other of m.file.enums) {
    if (!isIgnoredType(other) && gqlTypeName(other, files) === finalName) {
      fail(other.typeName);
    }
  }
}

export function isIgnoredType(type: DescMessage | DescEnum): boolean {
  if (getSchemaOptions(type).ignore) {
    return true;
  }
  switch (type.kind) {
    case "message":
      return getObjectTypeOptions(type).ignore;
    case "enum":
      return getEnumTypeOptions(type).ignore;
    default: {
      const _exhaustiveCheck: never = type;
      return false;
    }
  }
}

export function isIgnoredInputType(m: DescMessage): boolean {
  return isIgnoredType(m) || getInputTypeOptions(m).ignore;
}

export function isInterface(m: DescMessage): boolean {
  return getObjectTypeOptions(m).interface;
}

export function isSquashedUnion(m: DescMessage): boolean {
  return getObjectTypeOptions(m).squashUnion;
}

export function isRequiredField(
  field: DescField | DescOneof,
  fieldType: "output" | "input" | "partial_input",
): boolean {
  if (field.kind === "field") {
    let nullability: extensions.Nullability | null = null;
    const ext = getFieldOptions(field);
    if (ext != null) {
      switch (fieldType) {
        case "output": {
          nullability = ext.outputNullability;
          break;
        }
        case "input": {
          nullability = ext.inputNullability;
          break;
        }
        case "partial_input": {
          nullability = ext.partialInputNullability;
          break;
        }
        default: {
          const _exhaustiveCheck: never = fieldType;
          throw "unreachable";
        }
      }
    }
    switch (nullability) {
      case null:
      case extensions.Nullability.NULLABILITY_UNSPECIFIED:
        // no-op
        break;
      case extensions.Nullability.NON_NULL:
        return true;
      case extensions.Nullability.NULLABLE:
        return false;
      default: {
        const _exhaustiveCheck: never = nullability;
        throw "unreachable";
      }
    }
  }
  if (fieldType === "partial_input") return false;

  if (field.kind === "field" && field.proto.proto3Optional) return false;

  return hasRequiredLabel(field);
}

function hasRequiredLabel(field: DescField | DescOneof): boolean {
  if (
    field.kind === "field" &&
    (field.proto.label === FieldDescriptorProto_Label.REQUIRED ||
      (field.proto.type !== FieldDescriptorProto_Type.MESSAGE &&
        field.proto.type !== FieldDescriptorProto_Type.ENUM))
  ) {
    return true;
  }
  return extractBehaviorComments(field).includes("Required");
}

export function isOutputOnlyField(field: DescField | DescOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Output only");
}

export function isInputOnlyField(field: DescField | DescOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Input only");
}

export function isIgnoredField(
  field: DescField | DescEnumValue | DescOneof,
): boolean {
  let ext: { ignore: boolean } | undefined;
  if (field.kind === "field") {
    if (field.message && isIgnoredType(field.message)) {
      return true;
    }
    if (field.enum && isIgnoredType(field.enum)) {
      return true;
    }
    if (
      field.oneof &&
      !isSyntheticOneof(field.oneof) &&
      isIgnoredField(field.oneof)
    ) {
      return true;
    }
    ext = getFieldOptions(field);
  } else if (field.kind === "enum_value") {
    ext = getEnumValueOptions(field);
  } else if (field.kind === "oneof") {
    if (isIgnoredType(field.parent)) {
      return true;
    }
    if (isSyntheticOneof(field)) {
      return true;
    }
    ext = getOneofOptions(field);
  } else {
    const _exhaustiveCheck: never = field;
    throw "unreachable";
  }
  return ext?.ignore ?? false;
}

/**
 * @see https://github.com/protocolbuffers/protobuf/blob/v26.1/docs/implementing_proto3_presence.md
 */
export function isSyntheticOneof(desc: DescOneof): boolean {
  return desc.fields.length === 1 && desc.fields[0].proto.proto3Optional;
}

const behaviorComments = ["Required", "Input only", "Output only"] as const;

function extractBehaviorComments(
  field: DescField | DescOneof,
): (typeof behaviorComments)[number][] {
  return (getCommentsFor(field).leading?.trim() ?? "")
    .split(/\.\s+/, 3)
    .slice(0, 2)
    .map((c) => c.replace(/\.\s*$/, ""))
    .filter((c): c is (typeof behaviorComments)[number] =>
      behaviorComments.includes(c as any),
    );
}

export function descriptionFromProto(proto: CommentedDesc): string | null {
  return getCommentsFor(proto).leading?.trim() || null;
}

// Frozen, shared "no options set" defaults for each extension type. The
// `proto.options == null` branch fires on every descriptor that doesn't carry
// any `[graphql.*]` option in its `.proto` source — i.e. the common case —
// and each call site below would otherwise allocate a fresh empty message via
// `create(...)`. On a synthetic 400-message x 20-field fixture that path
// dominated CPU profiles (`createZeroMessage` 9.3% self time). All call sites
// read the returned object; nothing mutates it, so a single frozen instance
// is safe to share across the entire plugin run.
const EMPTY_SCHEMA_OPTIONS = Object.freeze(
  create(extensions.GraphqlSchemaOptionsSchema, {}),
);
const EMPTY_OBJECT_TYPE_OPTIONS = Object.freeze(
  create(extensions.GraphqlObjectTypeOptionsSchema, {}),
);
const EMPTY_INPUT_TYPE_OPTIONS = Object.freeze(
  create(extensions.GraphqlInputTypeOptionsSchema, {}),
);
const EMPTY_FIELD_OPTIONS = Object.freeze(
  create(extensions.GraphqlFieldOptionsSchema, {}),
);
const EMPTY_ONEOF_OPTIONS = Object.freeze(
  create(extensions.GraphqlOneofOptionsSchema, {}),
);
const EMPTY_ENUM_OPTIONS = Object.freeze(
  create(extensions.GraphqlEnumOptionsSchema, {}),
);
const EMPTY_ENUM_VALUE_OPTIONS = Object.freeze(
  create(extensions.GraphqlEnumValueOptionsSchema, {}),
);
const EMPTY_SERVICE_OPTIONS = Object.freeze(
  create(extensions.GraphqlServiceOptionsSchema, {}),
);
const EMPTY_RPC_OPTIONS = Object.freeze(
  create(extensions.GraphqlRpcOptionsSchema, {}),
);

/**
 * Exported so `collectOperationsFromFile` can read a *file's* schema options
 * directly (e.g. to detect the `ignore_requests`+`requests_as_inputs` /
 * `ignore_responses`+`responses_as_payloads` combinations and warn once per
 * file), in addition to the message/enum lookup every other call site here
 * uses.
 */
export function getSchemaOptions(
  desc: DescMessage | DescEnum | DescFile,
): extensions.GraphqlSchemaOptions {
  const file = desc.kind === "file" ? desc : desc.file;
  if (file.proto.options == null) return EMPTY_SCHEMA_OPTIONS;
  return getExtension(file.proto.options, extensions.schema);
}

function getObjectTypeOptions(
  desc: DescMessage,
): extensions.GraphqlObjectTypeOptions {
  if (desc.proto.options == null) return EMPTY_OBJECT_TYPE_OPTIONS;
  return getExtension(desc.proto.options, extensions.object_type);
}

export function getInputTypeOptions(
  desc: DescMessage,
): extensions.GraphqlInputTypeOptions {
  if (desc.proto.options == null) return EMPTY_INPUT_TYPE_OPTIONS;
  return getExtension(desc.proto.options, extensions.input_type);
}

export function getFieldOptions(
  desc: DescField,
): extensions.GraphqlFieldOptions {
  if (desc.proto.options == null) return EMPTY_FIELD_OPTIONS;
  return getExtension(desc.proto.options, extensions.field);
}

function getOneofOptions(desc: DescOneof): extensions.GraphqlOneofOptions {
  if (desc.proto.options == null) return EMPTY_ONEOF_OPTIONS;
  return getExtension(desc.proto.options, extensions.oneof);
}

function getEnumTypeOptions(desc: DescEnum): extensions.GraphqlEnumOptions {
  if (desc.proto.options == null) return EMPTY_ENUM_OPTIONS;
  return getExtension(desc.proto.options, extensions.enum_type);
}

function getEnumValueOptions(
  desc: DescEnumValue,
): extensions.GraphqlEnumValueOptions {
  if (desc.proto.options == null) return EMPTY_ENUM_VALUE_OPTIONS;
  return getExtension(desc.proto.options, extensions.enum_value);
}

export function getServiceOptions(
  desc: DescService,
): extensions.GraphqlServiceOptions {
  if (desc.proto.options == null) return EMPTY_SERVICE_OPTIONS;
  return getExtension(desc.proto.options, extensions.service);
}

export function getRpcOptions(desc: DescMethod): extensions.GraphqlRpcOptions {
  if (desc.proto.options == null) return EMPTY_RPC_OPTIONS;
  return getExtension(desc.proto.options, extensions.rpc);
}

/**
 * A service is opted into Query/Mutation generation iff the `(graphql.service)`
 * extension is *present* on it (R1.1).
 *
 * This must use `hasExtension` rather than `getServiceOptions`: the latter
 * returns the shared frozen `EMPTY_SERVICE_OPTIONS` singleton for services that
 * carry no `(graphql.service)` option, so an all-defaults opt-in (`option
 * (graphql.service) = {};`) is indistinguishable from "no option at all" by its
 * field values alone. Only presence of the extension carries the opt-in signal.
 *
 * `service.ignore` does *not* affect opt-in: an ignored service stays opted in
 * conceptually (its mere presence still requires the `protobuf-es` guard at the
 * plugin layer, R1.4) — it simply produces no operations.
 */
export function isServiceOptedIn(desc: DescService): boolean {
  const options = desc.proto.options;
  return options != null && hasExtension(options, extensions.service);
}
