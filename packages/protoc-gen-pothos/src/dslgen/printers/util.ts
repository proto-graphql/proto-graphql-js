import * as path from "node:path";

import type { DescEnum, DescMessage } from "@bufbuild/protobuf";
import {
  type EnumType,
  filename,
  generatedGraphQLTypeImportPath,
  type InputObjectField,
  type InputObjectType,
  type InterfaceType,
  type ObjectField,
  type ObjectOneofField,
  type ObjectType,
  type OneofUnionType,
  type PrinterOptions,
  type SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import {
  code,
  createImportSymbol,
  type ImportSymbol,
  type Printable,
} from "../../codegen/index.js";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;

export function pothosRefName(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): string {
  return `${type.typeName}$Ref`;
}

export function shapeTypeName(type: InputObjectType): string {
  return `${type.typeName}$Shape`;
}

export function fieldTypeRefPrintable(
  field:
    | ObjectField<
        ObjectType | EnumType | InterfaceType | SquashedOneofUnionType
      >
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PothosPrinterOptions,
): Printable[] {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return pothosRefPrintable(field.type);

  return code`${createImportSymbol(pothosRefName(field.type), importPath)}`;
}

export function shapeTypePrintable(type: InputObjectType): Printable[] {
  return code`${shapeTypeName(type)}`;
}

export function fieldTypeShapePrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return shapeTypePrintable(field.type);

  return code`${createImportSymbol(shapeTypeName(field.type), importPath)}`;
}

export function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

export function toProtoFuncPrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return code`${toProtoFuncName(field.type)}`;

  return code`${createImportSymbol(toProtoFuncName(field.type), importPath)}`;
}

export function pothosRefPrintable(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): Printable[] {
  return code`${pothosRefName(type)}`;
}

export function pothosBuilderPrintable(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType,
  opts: Pick<PothosPrinterOptions, "pothos" | "filenameSuffix">,
): Printable[] {
  const importPath = opts.pothos.builderPath.startsWith(".")
    ? path.relative(path.dirname(filename(type, opts)), opts.pothos.builderPath)
    : opts.pothos.builderPath;
  return code`${createImportSymbol("builder", importPath)}`;
}

export function protoTypeSymbol(
  proto: DescMessage | DescEnum,
  opts: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): ImportSymbol {
  const chunks = [proto.name];
  let current: DescMessage | DescEnum = proto;
  while (current.parent != null) {
    current = current.parent;
    chunks.unshift(current.name);
  }
  const symbolName = chunks.join("_");
  const importPath = protoImportPath(proto, opts);
  return createImportSymbol(symbolName, importPath);
}

function protoImportPath(
  t: DescMessage | DescEnum,
  o: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): string {
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
