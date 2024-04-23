import {
  DescFile,
  DescMessage,
  DescField,
  DescOneof,
  DescEnum,
  DescEnumValue,
  getExtension,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  DescComments,
} from "@bufbuild/protobuf";
import { pascalCase } from "change-case";

import * as extensions from "../__generated__/extensions/graphql/schema_pb";

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
    default:
      reason satisfies never;
      throw "unreachable";
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
      switch (desc.fieldKind) {
        case "message":
          return (
            getDeprecationReasonType(desc.message) ||
            getDeprecationReasonType(desc.parent)
          );
        case "enum":
          return (
            getDeprecationReasonType(desc.enum) ||
            getDeprecationReasonType(desc.parent)
          );
        case "scalar":
        case "map":
          return getDeprecationReasonType(desc.parent);
        default:
          desc satisfies never;
          throw "unreachable";
      }
    }
    case "oneof":
      if (desc.fields.every((f) => f.deprecated)) return desc;
      return getDeprecationReasonType(desc.parent);
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

export function exceptRequestOrResponse(
  files: readonly DescFile[],
): (m: DescMessage) => boolean {
  const reqSet = new Set();
  const respSet = new Set();
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

  return (m) => {
    const ext = getSchemaOptions(m);

    if (ext.ignoreRequests && reqSet.has(m.typeName)) return false;
    if (ext.ignoreResponses && respSet.has(m.typeName)) return false;

    return true;
  };
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
  if (field.kind === "field" && field.optional) return false;
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
  return desc.fields.length === 1 && desc.fields[0].optional;
}

const behaviorComments = ["Required", "Input only", "Output only"] as const;

function extractBehaviorComments(
  field: DescField | DescOneof,
): (typeof behaviorComments)[number][] {
  return (field.getComments().leading?.trim() ?? "")
    .split(/\.\s+/, 3)
    .slice(0, 2)
    .map((c) => c.replace(/\.\s*$/, ""))
    .filter((c): c is (typeof behaviorComments)[number] =>
      behaviorComments.includes(c as any),
    );
}

export function descriptionFromProto(proto: {
  getComments(): DescComments;
}): string | null {
  return proto.getComments().leading?.trim() || null;
}

function getSchemaOptions(
  desc: DescMessage | DescEnum,
): extensions.GraphqlSchemaOptions {
  if (desc.file.proto.options == null)
    return new extensions.GraphqlSchemaOptions();
  return getExtension(desc.file.proto.options, extensions.schema);
}

function getObjectTypeOptions(
  desc: DescMessage,
): extensions.GraphqlObjectTypeOptions {
  if (desc.proto.options == null)
    return new extensions.GraphqlObjectTypeOptions();
  return getExtension(desc.proto.options, extensions.object_type);
}

export function getInputTypeOptions(
  desc: DescMessage,
): extensions.GraphqlInputTypeOptions {
  if (desc.proto.options == null)
    return new extensions.GraphqlInputTypeOptions();
  return getExtension(desc.proto.options, extensions.input_type);
}

export function getFieldOptions(
  desc: DescField,
): extensions.GraphqlFieldOptions {
  if (desc.proto.options == null) return new extensions.GraphqlFieldOptions();
  return getExtension(desc.proto.options, extensions.field);
}

function getOneofOptions(desc: DescOneof): extensions.GraphqlOneofOptions {
  if (desc.proto.options == null) return new extensions.GraphqlOneofOptions();
  return getExtension(desc.proto.options, extensions.oneof);
}

function getEnumTypeOptions(desc: DescEnum): extensions.GraphqlEnumOptions {
  if (desc.proto.options == null) return new extensions.GraphqlEnumOptions();
  return getExtension(desc.proto.options, extensions.enum_type);
}

function getEnumValueOptions(
  desc: DescEnumValue,
): extensions.GraphqlEnumValueOptions {
  if (desc.proto.options == null)
    return new extensions.GraphqlEnumValueOptions();
  return getExtension(desc.proto.options, extensions.enum_value);
}
