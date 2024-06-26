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
import { type Code, type Import, code, def, imp } from "ts-poet";

export type NexusPrinterOptions = Extract<PrinterOptions, { dsl: "nexus" }>;

export function impNexus(name: string): Import {
  return imp(`${name}@nexus`);
}

export function impProtoNexus(name: string): Import {
  return imp(`${name}@proto-nexus`);
}

export function nexusTypeDef(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType,
): Code {
  return code`${def(type.typeName)}`;
}

export function fieldType(
  field:
    | ObjectField<
        ObjectType | EnumType | InterfaceType | SquashedOneofUnionType
      >
    | InputObjectField<InputObjectType | EnumType>
    | ObjectOneofField,
  opts: NexusPrinterOptions,
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath) return code`${imp(`${field.type.typeName}@${importPath}`)}`;
  return code`${field.type.typeName}`;
}
