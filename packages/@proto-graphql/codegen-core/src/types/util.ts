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
import path from "path";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

export const fileLayouts = ["proto_file", "graphql_type"] as const;
export type GenerationParams = {
  importPrefix: string | null;
  /** support only protoc-gen-nexus */
  useProtobufjs: boolean;
  /** support only protoc-gen-pothos */
  useTsProto: boolean;
  pothosBuilderPath: string;
  partialInputs: boolean;
  fileLayout: typeof fileLayouts[number];
  typeMappings: Record<string, string>;
  /**
   * Which type to map Protobuf's 64-bit integer type to on GraphQL(default: "String").
   * Only Int, String or custom scalars is supported.
   *
   * @remarks
   * Support only protoc-gen-pothos.
   *
   * @remarks
   * If you use ts-proto:
   * - when `longNumber="String"`, you should specify `forceLong=string` for ts-proto
   * - when `longNumber="Int"`, you should specify `forceLong=number` for ts-proto
   */
  longNumber: LongNumberMapping;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type LongNumberMapping = "String" | "Int" | (string & {});

export type FullName = [FullName, string] | string;

/**
 * @example js_out
 * ```
 * [["_$hello$hello_pb", "User"], "Role"]
 * ```
 *
 * @example protobufjs
 * ```
 * [[["_$hello", "hello"], "User"], "Role"]
 * ```
 *
 * @example ts-proto
 * ```
 * [[["_$hello", "hello"], "User_Role"]
 * ```
 */
export function createProtoFullName(t: ProtoMessage | ProtoEnum, o: GenerationParams): FullName {
  let left: FullName;
  if (t.parent.kind === "File") {
    if (o.useProtobufjs) {
      const pkgs = t.parent.package.split(".");
      left = pkgs.reduce<typeof left>((n, pkg) => [n, pkg], uniqueImportAlias(protoImportPath(t, o)));
    } else {
      left = uniqueImportAlias(protoImportPath(t, o));
    }
  } else {
    left = createProtoFullName(t.parent, o);
  }
  if (o.useTsProto && t.parent.kind !== "File") {
    return [left[0], `${left[1]}_${t.name}`];
  }
  return [left, t.name];
}

export function protoExportAlias(t: ProtoMessage, o: GenerationParams): string {
  const chunks = [protoImportPath(t, o)];
  if (o.useProtobufjs) {
    chunks.push(...t.file.package.split("."));
  }
  chunks.push(nameWithParent(t));
  return uniqueImportAlias(chunks.join("/"));
}

export function protoImportPath(t: ProtoMessage | ProtoEnum, o: GenerationParams) {
  const importPath = o.useProtobufjs
    ? path.dirname(t.file.name)
    : o.useTsProto
    ? t.file.name.slice(0, -1 * path.extname(t.file.name).length)
    : t.file.googleProtobufImportPath;
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`;
}

export function modulesWithUniqueImportAlias(
  modules: string[]
): { alias: string; module: string; type: "namespace" | "named" }[] {
  return modules.map((m) => ({ module: m, alias: uniqueImportAlias(m), type: "namespace" }));
}

export function uniqueImportAlias(path: string) {
  return path
    .replace(/@/g, "$$$$")
    .replace(/\.\.\//g, "__$$")
    .replace(/\.\//g, "_$$")
    .replace(/\//g, "$$")
    .replace(/\./g, "_")
    .replace(/-/g, "_");
}

export function gqlTypeName(typ: ProtoMessage | ProtoOneof | ProtoEnum): string {
  return nameWithParent(typ);
}

function nameWithParent(typ: ProtoMessage | ProtoOneof | ProtoEnum): string {
  let name = "";
  let t: ProtoMessage | ProtoOneof | ProtoEnum | ProtoFile = typ;
  for (;;) {
    if (t.kind === "File") break;
    let override: string | undefined;
    if (t.kind === "Message") {
      override = t.descriptor.getOptions()?.getExtension(extensions.objectType)?.getName();
    }
    name = `${t.kind === "Oneof" ? pascalCase(t.name) : override || t.name}${name}`;
    t = t.parent;
  }
  const prefix = t.descriptor.getOptions()?.getExtension(extensions.schema)?.getTypePrefix();
  if (prefix) {
    name = `${prefix}${name}`;
  }
  return name;
}

export function getDeprecationReason(
  proto: ProtoFile | ProtoMessage | ProtoOneof | ProtoField | ProtoEnum | ProtoEnumValue
): string | null {
  const reason = getDeprecationReasonType(proto);
  if (!reason) return null;

  if (reason.kind === "File") {
    return `${reason.name} is mark as deprecated.`;
  }

  return `${reason.fullName.toString()} is mark as deprecated in a *.proto file.`;
}

function getDeprecationReasonType(
  proto: ProtoFile | ProtoMessage | ProtoOneof | ProtoField | ProtoEnum | ProtoEnumValue
): ProtoFile | ProtoMessage | ProtoOneof | ProtoField | ProtoEnum | ProtoEnumValue | null {
  if (proto.deprecated) return proto;
  if (proto.kind === "Field" && proto.type !== null) {
    const r = getDeprecationReasonType(proto.type);
    if (r !== null) return r;
  }
  if ("parent" in proto) return getDeprecationReasonType(proto.parent);
  return null;
}

export function exceptRequestOrResponse(reg: ProtoRegistry): (m: ProtoMessage) => boolean {
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
    const ext = m.file.descriptor.getOptions()?.getExtension(extensions.schema);

    if (ext?.getIgnoreRequests() && reqSet.has(m.fullName.toString())) return false;
    if (ext?.getIgnoreResponses() && respSet.has(m.fullName.toString())) return false;

    return true;
  };
}

export function isIgnoredType(type: ProtoMessage | ProtoEnum): boolean {
  let ext: ExtensionFieldInfo<{ getIgnore(): boolean }>;
  if (type.file.descriptor.getOptions()?.getExtension(extensions.schema)?.getIgnore()) {
    return true;
  }
  if (type.kind === "Message") {
    ext = extensions.objectType;
  } else if (type.kind === "Enum") {
    ext = extensions.enumType;
  } else {
    const _exhaustiveCheck: never = type;
    throw "unreachable";
  }
  return type.descriptor.getOptions()?.getExtension(ext)?.getIgnore() ?? false;
}

export function isInterface(m: ProtoMessage): boolean {
  return m.descriptor.getOptions()?.getExtension(extensions.objectType)?.getInterface() ?? false;
}

export function isSquashedUnion(m: ProtoMessage): boolean {
  return m.descriptor.getOptions()?.getExtension(extensions.objectType)?.getSquashUnion() ?? false;
}

export function isScalar(m: ProtoMessage, opts: GenerationParams): boolean {
  return m.fullName.toString() in opts.typeMappings;
}

export function isRequiredField(
  field: ProtoField | ProtoOneof,
  fieldType: "output" | "input" | "partial_input"
): boolean {
  if (field.kind === "Field") {
    let nullability: extensions.NullabilityMap[keyof extensions.NullabilityMap] | null = null;
    const ext = field.descriptor.getOptions()?.getExtension(extensions.field);
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
  return hasRequiredLabel(field);
}

function hasRequiredLabel(field: ProtoField | ProtoOneof): boolean {
  if (
    field.kind === "Field" &&
    (field.descriptor.getLabel() === FieldDescriptorProto.Label.LABEL_REQUIRED ||
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

export function isIgnoredField(field: ProtoField | ProtoEnumValue | ProtoOneof): boolean {
  let ext: ExtensionFieldInfo<{ getIgnore(): boolean }>;
  if (field.kind === "Field") {
    if (field.type && (field.type.kind === "Message" || field.type.kind === "Enum") && isIgnoredType(field.type)) {
      return true;
    }
    const oneof = field.containingOneof;
    if (oneof && isIgnoredField(oneof)) {
      return true;
    }
    ext = extensions.field;
  } else if (field.kind === "EnumValue") {
    ext = extensions.enumValue;
  } else if (field.kind === "Oneof") {
    if (isIgnoredType(field.parent)) {
      return true;
    }
    ext = extensions.oneof;
  } else {
    const _exhaustiveCheck: never = field;
    throw "unreachable";
  }
  return field.descriptor.getOptions()?.getExtension(ext)?.getIgnore() ?? false;
}

const behaviorComments = ["Required", "Input only", "Output only"] as const;

function extractBehaviorComments(field: ProtoField | ProtoOneof): typeof behaviorComments[number][] {
  return (field.comments.leadingComments.trim() ?? "")
    .split(/\.\s+/, 3)
    .slice(0, 2)
    .map((c) => c.replace(/\.\s*$/, ""))
    .filter((c): c is typeof behaviorComments[number] => behaviorComments.includes(c as any));
}

export function descriptionFromProto(proto: { comments: CommentSet }): string | null {
  return proto.comments.leadingComments.trim() || null;
}
