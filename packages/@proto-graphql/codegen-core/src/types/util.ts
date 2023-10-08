import {
  CommentSet,
  ProtoEnum,
  ProtoEnumValue,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoOneof,
  ProtoRegistry,
} from "@proto-graphql/proto-descriptors";
import { pascalCase } from "change-case";
import { ExtensionFieldInfo } from "google-protobuf";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";

import { TypeOptions } from "./options";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

export function gqlTypeName(
  typ: ProtoMessage | ProtoOneof | ProtoEnum
): string {
  return nameWithParent(typ);
}

function nameWithParent(typ: ProtoMessage | ProtoOneof | ProtoEnum): string {
  let name = "";
  let t: ProtoMessage | ProtoOneof | ProtoEnum | ProtoFile = typ;
  for (;;) {
    if (t.kind === "File") break;
    let override: string | undefined;
    if (t.kind === "Message") {
      override = getExtension(t, "objectType")?.getName();
    }
    name = `${
      t.kind === "Oneof" ? pascalCase(t.name) : override || t.name
    }${name}`;
    t = t.parent;
  }
  const prefix = getExtension(t, "schema")?.getTypePrefix();
  if (prefix) {
    name = `${prefix}${name}`;
  }
  return name;
}

export function getDeprecationReason(
  proto:
    | ProtoFile
    | ProtoMessage
    | ProtoOneof
    | ProtoField
    | ProtoEnum
    | ProtoEnumValue
): string | null {
  const reason = getDeprecationReasonType(proto);
  if (!reason) return null;

  if (reason.kind === "File") {
    return `${reason.name} is mark as deprecated.`;
  }

  return `${reason.fullName.toString()} is mark as deprecated in a *.proto file.`;
}

function getDeprecationReasonType(
  proto:
    | ProtoFile
    | ProtoMessage
    | ProtoOneof
    | ProtoField
    | ProtoEnum
    | ProtoEnumValue
):
  | ProtoFile
  | ProtoMessage
  | ProtoOneof
  | ProtoField
  | ProtoEnum
  | ProtoEnumValue
  | null {
  if (proto.deprecated) return proto;
  if (
    proto.kind === "Field" &&
    proto.type !== null &&
    proto.type.kind !== "Scalar"
  ) {
    const r = getDeprecationReasonType(proto.type);
    if (r !== null) return r;
  }
  if ("parent" in proto) return getDeprecationReasonType(proto.parent);
  return null;
}

export function exceptRequestOrResponse(
  reg: ProtoRegistry
): (m: ProtoMessage) => boolean {
  const reqSet = new Set();
  const respSet = new Set();
  for (const f of Object.values(reg.fileByName)) {
    for (const s of f.services) {
      for (const m of s.methods) {
        if (m.input.name === `${m.name}Request`) {
          reqSet.add(m.input.fullName.toString());
        }
        if (m.output.name === `${m.name}Response`) {
          respSet.add(m.output.fullName.toString());
        }
      }
    }
  }

  return (m) => {
    const ext = getExtension(m.file, "schema");

    if (ext?.getIgnoreRequests() && reqSet.has(m.fullName.toString()))
      return false;
    if (ext?.getIgnoreResponses() && respSet.has(m.fullName.toString()))
      return false;

    return true;
  };
}

export function isIgnoredType(type: ProtoMessage | ProtoEnum): boolean {
  let ext: { getIgnore(): boolean } | undefined;
  if (getExtension(type.file, "schema")?.getIgnore()) {
    return true;
  }
  if (type.kind === "Message") {
    ext = getExtension(type, "objectType");
  } else if (type.kind === "Enum") {
    ext = getExtension(type, "enumType");
  } else {
    const _exhaustiveCheck: never = type;
    throw "unreachable";
  }
  return ext?.getIgnore() ?? false;
}

export function isIgnoredInputType(type: ProtoMessage): boolean {
  return (
    isIgnoredType(type) ||
    (getExtension(type, "inputType")?.getIgnore() ?? false)
  );
}

export function isInterface(m: ProtoMessage): boolean {
  return getExtension(m, "objectType")?.getInterface() ?? false;
}

export function isSquashedUnion(m: ProtoMessage): boolean {
  return getExtension(m, "objectType")?.getSquashUnion() ?? false;
}

export function isScalar(m: ProtoMessage, opts: TypeOptions): boolean {
  return m.fullName.toString() in opts.typeMappings;
}

export function isRequiredField(
  field: ProtoField | ProtoOneof,
  fieldType: "output" | "input" | "partial_input"
): boolean {
  if (field.kind === "Field") {
    let nullability:
      | extensions.NullabilityMap[keyof extensions.NullabilityMap]
      | null = null;
    const ext = getExtension(field, "field");
    if (ext != null) {
      switch (fieldType) {
        case "output": {
          nullability = ext.getOutputNullability();
          break;
        }
        case "input": {
          nullability = ext.getInputNullability();
          break;
        }
        case "partial_input": {
          nullability = ext.getPartialInputNullability();
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
  if (field.kind === "Field" && field.optional) return false;
  return hasRequiredLabel(field);
}

function hasRequiredLabel(field: ProtoField | ProtoOneof): boolean {
  if (
    field.kind === "Field" &&
    (field.descriptor.getLabel() ===
      FieldDescriptorProto.Label.LABEL_REQUIRED ||
      (field.descriptor.getType() !== FieldDescriptorProto.Type.TYPE_MESSAGE &&
        field.descriptor.getType() !== FieldDescriptorProto.Type.TYPE_ENUM))
  ) {
    return true;
  }
  return extractBehaviorComments(field).includes("Required");
}

export function isOutputOnlyField(field: ProtoField | ProtoOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Output only");
}

export function isInputOnlyField(field: ProtoField | ProtoOneof): boolean {
  const cs = extractBehaviorComments(field);
  return cs.includes("Input only");
}

export function isIgnoredField(
  field: ProtoField | ProtoEnumValue | ProtoOneof
): boolean {
  let ext: { getIgnore(): boolean } | undefined;
  if (field.kind === "Field") {
    if (
      field.type &&
      (field.type.kind === "Message" || field.type.kind === "Enum") &&
      isIgnoredType(field.type)
    ) {
      return true;
    }
    const oneof = field.containingOneof;
    if (oneof && !oneof.synthetic && isIgnoredField(oneof)) {
      return true;
    }
    ext = getExtension(field, "field");
  } else if (field.kind === "EnumValue") {
    ext = getExtension(field, "enumValue");
  } else if (field.kind === "Oneof") {
    if (isIgnoredType(field.parent)) {
      return true;
    }
    if (field.synthetic) {
      return true;
    }
    ext = getExtension(field, "oneof");
  } else {
    const _exhaustiveCheck: never = field;
    throw "unreachable";
  }
  return ext?.getIgnore() ?? false;
}

const behaviorComments = ["Required", "Input only", "Output only"] as const;

function extractBehaviorComments(
  field: ProtoField | ProtoOneof
): (typeof behaviorComments)[number][] {
  return (field.comments.leadingComments.trim() ?? "")
    .split(/\.\s+/, 3)
    .slice(0, 2)
    .map((c) => c.replace(/\.\s*$/, ""))
    .filter((c): c is (typeof behaviorComments)[number] =>
      behaviorComments.includes(c as any)
    );
}

export function descriptionFromProto(proto: {
  comments: CommentSet;
}): string | null {
  return proto.comments.leadingComments.trim() || null;
}

function getExtension<
  K extends ExtensionKind,
  P extends {
    schema: ProtoFile;
    objectType: ProtoMessage;
    inputType: ProtoMessage;
    field: ProtoField;
    oneof: ProtoOneof;
    enumType: ProtoEnum;
    enumValue: ProtoEnumValue;
  }[K],
>(proto: P, kind: K): Extension<K> | undefined {
  const extInfo = extensionInfoMap[kind];
  return proto.descriptor.getOptions()?.getExtension(extInfo) as any;
}

type ExtensionKind = keyof typeof extensionInfoMap;

type Extension<K extends ExtensionKind> =
  (typeof extensionInfoMap)[K] extends ExtensionFieldInfo<infer Opt>
    ? Opt
    : never;

const extensionInfoMap = {
  schema: extensions.schema,
  objectType: extensions.objectType,
  inputType: extensions.inputType,
  field: extensions.field,
  oneof: extensions.oneof,
  enumType: extensions.enumType,
  enumValue: extensions.enumValue,
} as const;
