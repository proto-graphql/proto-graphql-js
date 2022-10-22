import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createEnumTypeDslStmt } from "./enumType";
import { createInputObjectTypeDslStmts } from "./inputObjectType";
import { createObjectTypeDslStmts } from "./objectType";
import { createOneofUnionTypeDslStmt } from "./oneofUnionType";
import { createImportDecl, createQualifiedName, fullNameString, onlyNonNull, onlyUnique } from "./util";

export function createImportDecls(
  types: (ObjectType | InputObjectType | EnumType | OneofUnionType | SquashedOneofUnionType)[]
): ts.ImportDeclaration[] {
  return types
    .flatMap((t) => t.importModules)
    .filter(onlyUnique((m) => JSON.stringify([m.alias, m.module])))
    .sort(({ module: a }, { module: b }) => {
      const pat = /^\.+\//;
      const [aIsRel, bIsRel] = [a.match(pat), b.match(pat)];
      if (aIsRel && !bIsRel) return 1;
      if (!aIsRel && bIsRel) return -1;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    })
    .map((m) => createImportDecl(m));
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
    .flatMap((type) => {
      if (type instanceof ObjectType) {
        return createObjectTypeDslStmts(type);
      }
      if (type instanceof InputObjectType) {
        return createInputObjectTypeDslStmts(type);
      }
      if (type instanceof EnumType) {
        return [createEnumTypeDslStmt(type)];
      }
      if (type instanceof OneofUnionType || type instanceof SquashedOneofUnionType) {
        return [createOneofUnionTypeDslStmt(type)];
      }

      const _exhaustiveCheck: never = type;
      throw "unreachable";
    })
    .filter(onlyNonNull());
}
