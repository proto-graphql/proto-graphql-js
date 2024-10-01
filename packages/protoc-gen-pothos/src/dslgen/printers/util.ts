import { type Printable, createImportSymbol } from "@bufbuild/protoplugin";
import {
  type EnumType,
  type InputObjectField,
  type InputObjectType,
  type InterfaceType,
  type ObjectField,
  type ObjectOneofField,
  type ObjectType,
  type OneofUnionType,
  type PrinterOptions,
  type SquashedOneofUnionType,
  generatedGraphQLTypeImportPath,
} from "@proto-graphql/codegen-core";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;

export function pothosRef(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): Printable {
  return pothosRefName(type);
}

function pothosRefName(
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

export function shapeType(type: InputObjectType): Printable {
  return shapeTypeName(type);
}

export function shapeTypeName(type: InputObjectType): string {
  return `${type.typeName}$Shape`;
}

export function fieldTypeRef(
  field:
    | ObjectField<
        ObjectType | EnumType | InterfaceType | SquashedOneofUnionType
      >
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: PothosPrinterOptions,
): Printable {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return pothosRef(field.type);

  return createImportSymbol(pothosRefName(field.type), importPath);
}

export function fieldTypeShape(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return shapeType(field.type);

  return createImportSymbol(shapeTypeName(field.type), importPath);
}

export function pothosBuilder(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType,
  opts: Pick<
    PothosPrinterOptions,
    "dsl" | "pothos" | "fileLayout" | "filenameSuffix"
  >,
): Printable {
  return createImportSymbol("builder", opts.pothos.builderPath);
}
