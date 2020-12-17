import ts from "typescript";
import { ProtoEnum, ProtoMessage } from "../protoTypes";
import { getUnwrapFunc } from "./unwrap";
import {
  createImportAllWithAliastDecl,
  onlyNonNull,
  onlyUnique,
  protoImportPath,
} from "./util";

/**
 * @example
 * ```ts
 * import { objectType, enumType } from "@nexus/schema";
 * ```
 */
export function createImportNexusDecl(
  msgs: ReadonlyArray<ProtoMessage>,
  enums: ReadonlyArray<ProtoEnum>
): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        [
          msgs.length === 0
            ? null
            : ts.factory.createImportSpecifier(
                undefined,
                ts.factory.createIdentifier("objectType")
              ),
          enums.length === 0
            ? null
            : ts.factory.createImportSpecifier(
                undefined,
                ts.factory.createIdentifier("enumType")
              ),
        ].filter(onlyNonNull())
      )
    ),
    ts.factory.createStringLiteral("@nexus/schema")
  );
}

/**
 * @example
 * ```
 * import * as proto_nexus from "proto-nexus";
 * ```
 */
export function createImportUnwrapFuncDecls(
  msgs: ReadonlyArray<ProtoMessage>
): ts.ImportDeclaration[] {
  return msgs
    .flatMap((m) => m.fields)
    .flatMap((f) => getUnwrapFunc(f)?.imports ?? [])
    .filter(onlyUnique())
    .map(createImportAllWithAliastDecl);
}

/**
 * @example
 * ```
 * import * as _$hello$hello_pb from "./hello/hello_pb";
 * ```
 */
export function createImportProtoDecls(
  msgs: ReadonlyArray<ProtoMessage>,
  opts: { importPrefix?: string }
): ts.ImportDeclaration[] {
  return msgs
    .map((m) => protoImportPath(m, opts))
    .filter(onlyUnique())
    .map(createImportAllWithAliastDecl);
}
