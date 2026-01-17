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
import { type Code, code, imp } from "ts-poet";

import {
  type DescMessageField,
  isEnumField,
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
  opts: Pick<PrinterOptions, "filenameSuffix">,
): string {
  const file = (type.proto.kind === "oneof" ? type.proto.parent : type.proto)
    .file;
  return filenameFromProtoFile(file, opts);
}

export function filenameFromProtoFile(
  file: DescFile,
  opts: Pick<PrinterOptions, "filenameSuffix">,
) {
  return file.name + opts.filenameSuffix;
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
  obj: In,
): Out {
  return Object.keys(obj).reduce((newObj, key) => {
    const v = obj[key];
    return v == null ? newObj : Object.assign(newObj, { [key]: compact(v) });
  }, {} as Out);
}

export function protoType(
  origProto: DescMessage | DescEnum | DescField,
  opts: PrinterOptions,
): Code {
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
  if (origProtoType === undefined) {
    throw "unreachable";
  }
  let proto = origProtoType;
  const chunks = [proto.name];
  while (proto.parent != null) {
    proto = proto.parent;
    chunks.unshift(proto.name);
  }
  return code`${imp(`${chunks.join("_")}@${protoImportPath(proto, opts)}`)}`;
}

export function createGetFieldValueCode(
  parentExpr: Code,
  proto: DescField,
  opts: PrinterOptions,
): Code {
  return code`${parentExpr}.${tsFieldName(proto, opts)}`;
}

export function tsFieldName(
  desc: DescField | DescOneof,
  _opts: PrinterOptions,
): string {
  if (desc.kind === "oneof") {
    return camelCase(desc.name);
  }
  return desc.proto.jsonName || camelCase(desc.name);
}

export function createSetFieldValueCode(
  parentExpr: Code,
  valueExpr: Code,
  proto: DescField,
  opts: PrinterOptions,
): Code {
  return code`${parentExpr}.${tsFieldName(proto, opts)} = ${valueExpr}`;
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
    case "ts-proto": {
      importPath = t.file.name;
      break;
    }
    case "protobuf-es": {
      const { dir, name } = path.parse(t.file.name);
      importPath = `${dir}/${name}_pb`;
      break;
    }
    /* istanbul ignore next */
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
