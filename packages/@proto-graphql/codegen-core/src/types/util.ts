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

export function gqlTypeName(typ: DescMessage | DescOneof | DescEnum): string {
  return nameWithParent(typ);
}

function nameWithParent(typ: DescMessage | DescOneof | DescEnum): string {
  let name = "";
  let t: DescMessage | DescOneof | DescEnum | undefined = typ;
  for (;;) {
    if (t == null) break;
    let override: string | undefined;
    if (t.kind === "message") {
      override = getObjectTypeOptions(t).name;
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

// `exceptRequestOrResponse` is called three times per file (the object, input,
// and interface builders), and `collectTypesFromFile` runs once per generated
// file with `schema.allFiles` — so the request/response set scan ran
// files²·3 times on large schemas (the set-building loop was ~22% of self time
// on a 538-file schema). Both the sets and the returned predicate depend only
// on the `files` array, which is a stable reference for the whole run, so
// memoize by it and build the predicate exactly once.
const reqRespPredicateCache = new WeakMap<
  readonly DescFile[],
  (m: DescMessage) => boolean
>();

export function exceptRequestOrResponse(
  files: readonly DescFile[],
): (m: DescMessage) => boolean {
  const cached = reqRespPredicateCache.get(files);
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

  const predicate = (m: DescMessage): boolean => {
    const ext = getSchemaOptions(m);

    if (ext.ignoreRequests && reqSet.has(m.typeName)) return false;
    if (ext.ignoreResponses && respSet.has(m.typeName)) return false;

    return true;
  };
  reqRespPredicateCache.set(files, predicate);
  return predicate;
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

function getSchemaOptions(
  desc: DescMessage | DescEnum,
): extensions.GraphqlSchemaOptions {
  if (desc.file.proto.options == null) return EMPTY_SCHEMA_OPTIONS;
  return getExtension(desc.file.proto.options, extensions.schema);
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
