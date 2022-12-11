import {
  EnumType,
  generatedGraphQLTypeImportPath,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  PrinterOptions,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { ProtoField, ProtoMessage, ProtoScalarType } from "@proto-graphql/proto-descriptors";
import { code, Code, def, imp, Import } from "ts-poet";

export type NexusPrinterOptions = Extract<PrinterOptions, { dsl: "nexus" }>;

export function impNexus(name: string): Import {
  return imp(`${name}@nexus`);
}

export function impProtoNexus(name: string): Import {
  return imp(`${name}@proto-nexus`);
}

export function nexusTypeDef(
  type: ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType
): Code {
  return code`${def(type.typeName)}`;
}

const longScalarPrimitiveTypes: ReadonlySet<ProtoScalarType> = new Set([
  "int64",
  "uint64",
  "fixed64",
  "sfixed64",
  "sint64",
]);
const longScalarWrapperTypes: ReadonlySet<string> = new Set([
  "google.protobuf.Int64Value",
  "google.protobuf.UInt64Value",
]);

export function isProtobufLong(proto: ProtoField): boolean {
  switch (proto.type.kind) {
    case "Scalar":
      return longScalarPrimitiveTypes.has(proto.type.type);
    case "Message":
      return longScalarWrapperTypes.has(proto.type.fullName.toString());
    default:
      return false;
  }
}

export function fieldType(
  field:
    | ObjectField<ObjectType | EnumType | InterfaceType | SquashedOneofUnionType>
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: NexusPrinterOptions
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath) return code`${imp(`${field.type.typeName}@${importPath}`)}`;
  return code`${field.type.typeName}`;
}

export function isWellKnownType(proto: ProtoField["type"]): proto is ProtoMessage {
  return proto.kind === "Message" && proto.file.name.startsWith("google/protobuf/");
}
