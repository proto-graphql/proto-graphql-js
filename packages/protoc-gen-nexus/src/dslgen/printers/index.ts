import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { Code } from "ts-poet";
import ts from "typescript";
import { createEnumTypeCode, createEnumTypeDslStmt } from "./enumType";
import { createInputObjectTypeCode, createInputObjectTypeDslStmt } from "./inputObjectType";
import { createObjectTypeCode, createObjectTypeDslStmt } from "./objectType";
import { createOneofUnionTypeCode, createOneofUnionTypeDslStmt } from "./oneofUnionType";
import {
  createImportAllWithAliastDecl,
  createQualifiedName,
  fullNameString,
  NexusPrinterOptions,
  onlyNonNull,
  onlyUnique,
} from "./util";

export function createTypeDslCodes(
  types: (ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType)[],
  opts: NexusPrinterOptions
): Code[] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return createObjectTypeCode(type, opts);
    }
    if (type instanceof InputObjectType) {
      return createInputObjectTypeCode(type, opts);
    }
    if (type instanceof EnumType) {
      return createEnumTypeCode(type);
    }
    if (type instanceof OneofUnionType || type instanceof SquashedOneofUnionType) {
      return createOneofUnionTypeCode(type, opts);
    }

    const _exhaustiveCheck: never = type;
    throw "unreachable";
  });
}

export function createImportDecls(
  types: (ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType)[]
): ts.ImportDeclaration[] {
  return types
    .flatMap((t) => t.importModules)
    .sort()
    .filter(onlyUnique((m) => m.module))
    .sort(({ module: a }, { module: b }) => {
      const pat = /^\.+\//;
      const [aIsRel, bIsRel] = [a.match(pat), b.match(pat)];
      if (aIsRel && !bIsRel) return 1;
      if (!aIsRel && bIsRel) return -1;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .map((m) => createImportAllWithAliastDecl(m));
}

export function createReExportStmts(
  types: (ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType)[]
): ts.Statement[] {
  return types
    .flatMap((t) => t.exportTypes)
    .sort()
    .filter(onlyUnique(({ type }) => fullNameString(type)))
    .map(({ name, type }) =>
      ts.factory.createTypeAliasDeclaration(
        undefined,
        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
        name,
        undefined,
        ts.factory.createTypeReferenceNode(createQualifiedName(type))
      )
    );
}

export function createTypeDslStmts(
  types: (ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType)[]
): ts.Statement[] {
  return types
    .map((type) => {
      if (type instanceof ObjectType) {
        return createObjectTypeDslStmt(type);
      }
      if (type instanceof InputObjectType) {
        return createInputObjectTypeDslStmt(type);
      }
      if (type instanceof EnumType) {
        return createEnumTypeDslStmt(type);
      }
      if (type instanceof OneofUnionType || type instanceof SquashedOneofUnionType) {
        return createOneofUnionTypeDslStmt(type);
      }

      const _exhaustiveCheck: never = type;
      throw "unreachable";
    })
    .filter(onlyNonNull());
}
