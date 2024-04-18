import * as path from "path";

import {
  DescFile,
  DescMessage,
  DescField,
  DescEnum,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";
import { camelCase as camelCaseAnything } from "case-anything";
import { camelCase } from "change-case";
import { Code, code, imp } from "ts-poet";

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
  const file = (type.proto.kind === "oneof" ? type.proto.parent : type.proto)
    .file;
  switch (opts.fileLayout) {
    case "proto_file":
      return filenameFromProtoFile(file, opts);
    case "graphql_type": {
      return path.join(
        path.dirname(file.name),
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
  file: DescFile,
  opts: Pick<PrinterOptions, "fileLayout" | "filenameSuffix">
) {
  switch (opts.fileLayout) {
    case "proto_file":
      return file.name + opts.filenameSuffix;
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
  origProto: DescMessage | DescEnum | DescField,
  opts: PrinterOptions
): Code {
  let origProtoType: DescMessage | DescEnum | undefined;
  switch (origProto.kind) {
    case "message":
    case "enum":
      origProtoType = origProto;
      break;
    case "field":
      switch (origProto.fieldKind) {
        case "message":
          origProtoType = origProto.message;
          break;
        case "enum":
          origProtoType = origProto.enum;
          break;
        case "map":
          throw new Error("cannot import protobuf map types");
        case "scalar":
          throw new Error("cannot import protobuf primitive types");
        default:
          origProto satisfies never;
          throw "unreachable";
      }
      break;
    default:
      origProto satisfies never;
      throw "unreachable";
  }
  if (origProtoType === undefined) {
    throw "unreachable";
  }
  let proto = origProtoType;
  const chunks = [proto.name];
  while (proto.parent != null) {
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
      chunks.unshift(...(proto.file.proto.package ?? "").split("."));
      const importPath = protoImportPath(
        origProto.kind === "field" ? origProto.parent : origProto,
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
  parentExpr: Code,
  proto: DescField,
  opts: PrinterOptions
): Code {
  switch (opts.protobuf) {
    case "google-protobuf": {
      return code`${parentExpr}.${googleProtobufFieldAccessor("get", proto)}()`;
    }
    case "protobufjs":
    case "ts-proto": {
      return code`${parentExpr}.${tsFieldName(proto, opts)}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function tsFieldName(desc: DescField, opts: PrinterOptions): string {
  switch (opts.protobuf) {
    case "google-protobuf": {
      throw "unsupported";
    }
    case "protobufjs":
      return camelCase(desc.name);
    case "ts-proto": {
      return camelCaseAnything(desc.name);
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function createSetFieldValueCode(
  parentExpr: Code,
  valueExpr: Code,
  proto: DescField,
  opts: PrinterOptions
): Code {
  switch (opts.protobuf) {
    case "google-protobuf": {
      return code`${parentExpr}.${googleProtobufFieldAccessor(
        "set",
        proto
      )}(${valueExpr})`;
    }
    case "protobufjs":
    case "ts-proto": {
      return code`${parentExpr}.${tsFieldName(proto, opts)} = ${valueExpr}`;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

function googleProtobufFieldAccessor(type: "get" | "set", proto: DescField) {
  return `${type}${upperCaseFirst(
    proto.jsonName ?? camelCaseAnything(proto.name)
  )}${proto.repeated ? "List" : ""}`;
}

function upperCaseFirst(s: string): string {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
}

const longScalarPrimitiveTypes: ReadonlySet<ProtoScalarType> = new Set([
  ProtoScalarType.INT64,
  ProtoScalarType.UINT64,
  ProtoScalarType.FIXED64,
  ProtoScalarType.SFIXED64,
  ProtoScalarType.SINT64,
]);
const longScalarWrapperTypes: ReadonlySet<string> = new Set([
  "google.protobuf.Int64Value",
  "google.protobuf.UInt64Value",
]);

export function isProtobufLong(proto: DescField): boolean {
  switch (proto.fieldKind) {
    case "scalar":
      return longScalarPrimitiveTypes.has(proto.scalar);
    case "message":
      return longScalarWrapperTypes.has(proto.message.typeName);
    default:
      return false;
  }
}

export function isProtobufWellKnownTypeField(
  proto: DescField
): proto is Extract<DescField, { fieldKind: "message" }> {
  return (
    proto.fieldKind === "message" &&
    proto.message.file.name.startsWith("google/protobuf/")
  );
}

function protoImportPath(
  t: DescMessage | DescEnum,
  o: Pick<PrinterOptions, "protobuf" | "importPrefix">
) {
  const importPath =
    o.protobuf === "protobufjs"
      ? path.dirname(t.file.name)
      : o.protobuf === "ts-proto"
      ? t.file.name
      : googleProtobufImportPath(t.file);
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`.replace(
    /(?<!:)\/\//,
    "/"
  );
}

function googleProtobufImportPath(file: DescFile): string {
  const { dir, name } = path.parse(file.name);
  return `${dir}/${name}_pb`;
}
