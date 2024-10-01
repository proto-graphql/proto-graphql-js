import * as path from "node:path";

import {
  type DescEnum,
  type DescField,
  type DescFile,
  type DescMessage,
  type DescOneof,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";
import { camelCase } from "change-case";

import {
  type GeneratedFile,
  type Printable,
  createImportSymbol,
} from "@bufbuild/protoplugin";
import {
  type DescMessageField,
  isEnumField,
  isListField,
  isMapField,
  isMessageField,
  isScalarField,
} from "../proto/util.js";
import {
  type EnumType,
  type InputObjectField,
  type InputObjectType,
  type InterfaceType,
  type ObjectField,
  ObjectOneofField,
  type ObjectType,
  type OneofUnionType,
  type SquashedOneofUnionType,
} from "../types/index.js";
import type { PrinterOptions } from "./options.js";

export function filename(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
  opts: Pick<PrinterOptions, "dsl" | "fileLayout" | "filenameSuffix">,
): string {
  const file = (type.proto.kind === "oneof" ? type.proto.parent : type.proto)
    .file;
  switch (opts.fileLayout) {
    case "proto_file":
      return filenameFromProtoFile(file, opts);
    case "graphql_type":
      return path.join(
        path.dirname(file.name),
        `${type.typeName}.${opts.dsl}.ts`,
      );
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.fileLayout;
      throw "unreachable";
    }
  }
}

export function filenameFromProtoFile(
  file: DescFile,
  opts: Pick<PrinterOptions, "fileLayout" | "filenameSuffix">,
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
  opts: PrinterOptions,
): string | null {
  if (field instanceof ObjectOneofField) return null;

  const [fromPath, toPath] = [
    filename(field.parent, opts),
    filename(field.type, opts),
  ].map((f) => (path.isAbsolute(f) ? `.${path.sep}${f}` : f));

  if (fromPath === toPath) return null;

  switch (opts.fileLayout) {
    case "proto_file":
      return protoImportPath(field.type.proto, {
        ...opts,
        importPrefix: null,
      })
        .replace(/_pb$/, opts.filenameSuffix)
        .replace(/\.ts$/, "");
    case "graphql_type": {
      const importPath = path
        .relative(path.dirname(fromPath), toPath)
        .replace(/\.ts$/, "");
      return importPath.match(/^[./]/) ? importPath : `./${importPath}`;
    }
    default: {
      opts.fileLayout satisfies never;
      throw "unreachable";
    }
  }
}

export function createProtoTypeExpr(
  origProto: DescMessage | DescEnum | DescField,
  opts: PrinterOptions,
): Printable {
  let origProtoType: DescMessage | DescEnum | undefined;
  switch (origProto.kind) {
    case "message":
    case "enum": {
      origProtoType = origProto;
      break;
    }
    case "field": {
      if (isMessageField(origProto)) {
        origProtoType = origProto.message;
      } else if (isEnumField(origProto)) {
        origProtoType = origProto.enum;
      } else if (isScalarField(origProto)) {
        throw new Error("cannot import protobuf primitive types");
      } else if (isMapField(origProto)) {
        throw new Error("cannot import protobuf map types");
      } else {
        origProto satisfies never;
        throw "unreachable";
      }
      break;
    }
    default: {
      origProto satisfies never;
      throw "unreachable";
    }
  }
  let proto = origProtoType;
  const chunks = [proto.name];
  while (proto.parent != null) {
    proto = proto.parent;
    chunks.unshift(proto.name);
  }
  switch (opts.protobuf) {
    case "google-protobuf": {
      const [first, ...rest] = chunks;
      return [
        createImportSymbol(first, protoImportPath(proto, opts)),
        ".",
        rest.join("."),
      ];
    }
    case "protobufjs": {
      chunks.unshift(...(proto.file.proto.package ?? "").split("."));
      const importPath = protoImportPath(
        origProto.kind === "field" ? origProto.parent : origProto,
        opts,
      );
      const [first, ...rest] = chunks;
      return [createImportSymbol(first, importPath), ".", rest.join(".")];
    }
    case "ts-proto":
    case "protobuf-es": {
      return [
        createImportSymbol(chunks.join("_"), protoImportPath(proto, opts)),
      ];
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function createGetFieldValueExpr(
  parentExpr: Printable,
  proto: DescField,
  opts: PrinterOptions,
): Printable {
  switch (opts.protobuf) {
    case "google-protobuf": {
      return [parentExpr, ".", googleProtobufFieldAccessor("get", proto), "()"];
    }
    case "protobufjs":
    case "ts-proto":
    case "protobuf-es": {
      return [parentExpr, ".", tsFieldName(proto, opts)];
    }
    /* istanbul ignore next */
    default: {
      opts satisfies never;
      throw "unreachable";
    }
  }
}

export function tsFieldName(
  desc: DescField | DescOneof,
  opts: PrinterOptions,
): string {
  switch (opts.protobuf) {
    case "google-protobuf": {
      throw "unsupported";
    }
    case "protobufjs":
      return camelCase(desc.name);
    case "ts-proto":
    case "protobuf-es": {
      if (desc.kind === "oneof") {
        return camelCase(desc.name);
      }
      return desc.proto.jsonName || camelCase(desc.name);
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts;
      throw "unreachable";
    }
  }
}

export function printSetFieldValueStmt(
  g: GeneratedFile,
  parentExpr: Printable,
  valueExpr: Printable,
  proto: DescField,
  opts: PrinterOptions,
) {
  switch (opts.protobuf) {
    case "google-protobuf": {
      g.print(
        parentExpr,
        ".",
        googleProtobufFieldAccessor("set", proto),
        "(",
        valueExpr,
        ")",
      );
      return;
    }
    case "protobufjs":
    case "ts-proto":
    case "protobuf-es": {
      g.print(parentExpr, ".", tsFieldName(proto, opts), " = ", valueExpr);
      return;
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
    proto.jsonName || proto.proto.jsonName || camelCase(proto.name),
  )}${isListField(proto) ? "List" : ""}`;
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
  if (isMessageField(proto)) {
    return longScalarWrapperTypes.has(proto.message.typeName);
  }
  if (isScalarField(proto)) {
    return longScalarPrimitiveTypes.has(proto.scalar);
  }
  if (isEnumField(proto) || isMapField(proto)) {
    return false;
  }

  proto satisfies never;
  return false;
}

export function isProtobufWellKnownTypeField(
  proto: DescField,
): proto is DescMessageField {
  return (
    isMessageField(proto) &&
    proto.message.file.name.startsWith("google/protobuf/")
  );
}

function protoImportPath(
  t: DescMessage | DescEnum,
  o: Pick<PrinterOptions, "protobuf" | "importPrefix">,
) {
  let importPath: string;
  switch (o.protobuf) {
    case "google-protobuf": {
      importPath = googleProtobufImportPath(t.file);
      break;
    }
    case "protobufjs": {
      importPath = path.dirname(t.file.name);
      break;
    }
    case "ts-proto": {
      importPath = t.file.name;
      break;
    }
    case "protobuf-es": {
      importPath = googleProtobufImportPath(t.file);
      break;
    }
    default: {
      o.protobuf satisfies never;
      throw new Error(`unexpected protobuf option: ${o.protobuf}`);
    }
  }
  return `${o.importPrefix ? `${o.importPrefix}/` : "./"}${importPath}`.replace(
    /(?<!:)\/\//,
    "/",
  );
}

function googleProtobufImportPath(file: DescFile): string {
  const { dir, name } = path.parse(file.name);
  return `${dir}/${name}_pb`;
}
