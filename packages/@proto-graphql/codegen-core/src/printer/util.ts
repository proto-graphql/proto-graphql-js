import * as path from "path";

import {
  ProtoEnum,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoScalar,
  ProtoScalarType,
} from "@proto-graphql/proto-descriptors";
import { camelCase } from "change-case";
import { code, Code, imp } from "ts-poet";

import { PrinterOptions } from "./options";
import {
  EnumType,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "../types";

export function filename(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
  opts: Pick<PrinterOptions, "dsl" | "fileLayout" | "filenameSuffix">
): string {
  switch (opts.fileLayout) {
    case "proto_file":
      return filenameFromProtoFile(type.proto.file, opts);
    case "graphql_type": {
      return path.join(
        path.dirname(type.proto.file.name),
        `${type.typeName}.${opts.dsl}.ts`
      );
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.fileLayout;
      throw "unreachable";
    }
  }
}

export function filenameFromProtoFile(
  file: ProtoFile,
  opts: Pick<PrinterOptions, "fileLayout" | "filenameSuffix">
) {
  switch (opts.fileLayout) {
    case "proto_file":
      return file.name.replace(/\.proto$/, opts.filenameSuffix);
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: "graphql_type" = opts.fileLayout;
      throw "unreachable";
    }
  }
}

export function generatedGraphQLTypeImportPath(
  field:
    | ObjectField<
        ObjectType | EnumType | InterfaceType | SquashedOneofUnionType
      >
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PrinterOptions
): string | null {
  if (field instanceof ObjectOneofField) return null;
  const [fromPath, toPath] = [
    filename(field.parent, opts),
    filename(field.type, opts),
  ].map((f) => (path.isAbsolute(f) ? `.${path.sep}${f}` : f));

  if (fromPath === toPath) return null;

  const importPath = path
    .relative(path.dirname(fromPath), toPath)
    .replace(/\.ts$/, "");
  return importPath.match(/^[./]/) ? importPath : `./${importPath}`;
}

/** Remove nullish values recursively. */
export function compact(v: any): any {
  if (typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(compact);
  if (v == null) return v;
  if ("toCodeString" in v) return v; // ignore nodes of ts-poet
  return compactObj(v);
}

function compactObj<In extends Out, Out extends Record<string, unknown>>(
  obj: In
): Out {
  return Object.keys(obj).reduce((newObj, key) => {
    const v = obj[key];
    return v == null ? newObj : { ...newObj, [key]: compact(v) };
  }, {} as Out);
}

export function protoType(
  origProto: ProtoMessage | ProtoEnum | ProtoField,
  opts: PrinterOptions
): Code {
  const origProtoType = origProto.kind === "Field" ? origProto.type : origProto;
  if (origProtoType.kind === "Scalar") {
    throw new Error("cannot import protobuf primitive types");
  }
  let proto = origProtoType;
  const chunks = [proto.name];
  while (proto.parent.kind !== "File") {
    proto = proto.parent;
    chunks.unshift(proto.name);
  }
  switch (opts.protobuf) {
    case "google-protobuf": {
      return code`${imp(`${chunks[0]}@${protoImportPath(proto, opts)}`)}${chunks
        .slice(1)
        .map((c) => `.${c}`)
        .join("")}`;
    }
    case "protobufjs": {
      chunks.unshift(...proto.file.package.split("."));
      const importPath = protoImportPath(
        origProto.kind === "Field" ? origProto.parent : origProto,
        opts
      );
      return code`${imp(`${chunks[0]}@${importPath}`)}.${chunks
        .slice(1)
        .join(".")}`;
    }
    case "ts-proto": {
      return code`${imp(
        `${chunks.join("_")}@${protoImportPath(proto, opts)}`
      )}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function createGetFieldValueCode(
  parent: Code,
  proto: ProtoField,
  opts: PrinterOptions
): Code {
  switch (opts.protobuf) {
    case "google-protobuf": {
      return code`${parent}.${googleProtobufFieldAccessor("get", proto)}()`;
    }
    case "protobufjs": {
      return code`${parent}.${camelCase(proto.name)}`;
    }
    case "ts-proto": {
      return code`${parent}.${proto.jsonName}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function createSetFieldValueCode(
  parent: Code,
  value: Code,
  proto: ProtoField,
  opts: PrinterOptions
): Code {
  switch (opts.protobuf) {
    case "google-protobuf": {
      return code`${parent}.${googleProtobufFieldAccessor(
        "set",
        proto
      )}(${value})`;
    }
    case "protobufjs": {
      return code`${parent}.${camelCase(proto.name)} = ${value}`;
    }
    case "ts-proto": {
      return code`${parent}.${proto.jsonName} = ${value}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

function googleProtobufFieldAccessor(type: "get" | "set", proto: ProtoField) {
  return `${type}${upperCaseFirst(proto.jsonName)}${proto.list ? "List" : ""}`;
}

function upperCaseFirst(s: string): string {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
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

export function isProtobufPrimitiveType(
  proto: ProtoField["type"]
): proto is ProtoScalar {
  return proto.kind === "Scalar";
}

export function isProtobufWrapperType(
  proto: ProtoField["type"]
): proto is ProtoMessage {
  return (
    proto.kind === "Message" &&
    proto.file.name === "google/protobuf/wrappers.proto"
  );
}

export function isProtobufWellKnownType(
  proto: ProtoField["type"]
): proto is ProtoMessage {
  return (
    proto.kind === "Message" && proto.file.name.startsWith("google/protobuf/")
  );
}

function protoImportPath(
  t: ProtoMessage | ProtoEnum,
  o: Pick<PrinterOptions, "protobuf" | "importPrefix">
) {
  const importPath =
    o.protobuf === "protobufjs"
      ? path.dirname(t.file.name)
      : o.protobuf === "ts-proto"
      ? t.file.name.slice(0, -1 * path.extname(t.file.name).length)
      : googleProtobufImportPath(t.file);
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`.replace(
    /(?<!:)\/\//,
    "/"
  );
}

function googleProtobufImportPath(file: ProtoFile): string {
  const { dir, name } = path.parse(file.name);
  return `${dir}/${name}_pb`;
}
