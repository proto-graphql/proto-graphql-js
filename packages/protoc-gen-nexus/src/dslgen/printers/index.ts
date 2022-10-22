import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createEnumTypeDslStmt } from "./enumType";
import { createInputObjectTypeDslStmt } from "./inputObjectType";
import { createObjectTypeDslStmt } from "./objectType";
import { createOneofUnionTypeDslStmt } from "./oneofUnionType";
import { createImportAllWithAliastDecl, createQualifiedName, fullNameString, onlyNonNull, onlyUnique } from "./util";

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
