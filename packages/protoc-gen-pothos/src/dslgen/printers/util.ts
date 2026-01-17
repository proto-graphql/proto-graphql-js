import * as path from "node:path";

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
import { type Code, code, imp } from "ts-poet";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;

export function pothosRef(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | InterfaceType,
): Code {
  return code`${pothosRefName(type)}`;
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

export function shapeType(type: InputObjectType): Code {
  return code`${shapeTypeName(type)}`;
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
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return pothosRef(field.type);

  const imported = imp(`IMPORTED_PLACEHOLDER@${importPath}`);
  imported.symbol = pothosRefName(field.type); // NOTE: Workaround for ts-poet not recognizing "$" as an identifier
  return code`${imported}`;
}

export function fieldTypeShape(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return shapeType(field.type);

  const imported = imp(`IMPORTED_PLACEHOLDER@${importPath}`);
  imported.symbol = shapeTypeName(field.type); // NOTE: Workaround for ts-poet not recognizing "$" as an identifier
  return code`${imported}`;
}

export function pothosBuilder(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType,
  opts: Pick<PothosPrinterOptions, "pothos" | "filenameSuffix">,
): Code {
  const importPath = opts.pothos.builderPath.startsWith(".")
    ? path.relative(path.dirname(filename(type, opts)), opts.pothos.builderPath)
    : opts.pothos.builderPath;
  return code`${imp(`builder@${importPath}`)}`;
}
