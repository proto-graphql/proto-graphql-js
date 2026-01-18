import * as path from "node:path";

import type { DescEnum, DescMessage } from "@bufbuild/protobuf";
import {
  type EnumType,
  filename,
  type InputObjectField,
  type InputObjectType,
  type InterfaceType,
  type ObjectField,
  ObjectOneofField,
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

type TypeWithFilename =
  | ObjectType
  | InputObjectType
  | EnumType
  | OneofUnionType
  | SquashedOneofUnionType
  | InterfaceType;

function resolveImportOrLocal(
  field: { parent: TypeWithFilename; type: TypeWithFilename },
  opts: PothosPrinterOptions,
  symbolName: string,
  localPrintable: () => Printable[],
): Printable[] {
  const fromFile = filename(field.parent, opts);
  const toFile = filename(field.type, opts);
  if (fromFile === toFile) return localPrintable();

  const importPath = `./${toFile.replace(/\.ts$/, "")}`;
  return code`${createImportSymbol(symbolName, importPath)}`;
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
  if (field instanceof ObjectOneofField) return pothosRefPrintable(field.type);

  return resolveImportOrLocal(field, opts, pothosRefName(field.type), () =>
    pothosRefPrintable(field.type),
  );
}

export function shapeTypePrintable(type: InputObjectType): Printable[] {
  return code`${shapeTypeName(type)}`;
}

export function fieldTypeShapePrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  return resolveImportOrLocal(field, opts, shapeTypeName(field.type), () =>
    shapeTypePrintable(field.type),
  );
}

export function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

export function toProtoFuncPrintable(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable[] {
  return resolveImportOrLocal(
    field,
    opts,
    toProtoFuncName(field.type),
    () => code`${toProtoFuncName(field.type)}`,
  );
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
  opts: Pick<PothosPrinterOptions, "pothos">,
): Printable[] {
  // protoplugin が自動的に相対パスを計算するため、builderPath をそのまま使用
  return code`${createImportSymbol("builder", opts.pothos.builderPath)}`;
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

/**
 * protobuf-es v2 用: Schema シンボル (例: UserSchema, Parent_ChildSchema) を生成
 */
export function protoSchemaSymbol(
  proto: DescMessage | DescEnum,
  opts: Pick<PrinterOptions, "protobuf" | "importPrefix">,
): ImportSymbol {
  const chunks = [proto.name];
  let current: DescMessage | DescEnum = proto;
  while (current.parent != null) {
    current = current.parent;
    chunks.unshift(current.name);
  }
  const symbolName = `${chunks.join("_")}Schema`;
  const importPath = protoImportPath(proto, opts);
  return createImportSymbol(symbolName, importPath);
}

/**
 * @bufbuild/protobuf から create 関数を import
 */
export function protobufCreateSymbol(): ImportSymbol {
  return createImportSymbol("create", "@bufbuild/protobuf");
}

/**
 * @bufbuild/protobuf から isMessage 関数を import
 */
export function protobufIsMessageSymbol(): ImportSymbol {
  return createImportSymbol("isMessage", "@bufbuild/protobuf");
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
    case "protobuf-es-v1":
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
