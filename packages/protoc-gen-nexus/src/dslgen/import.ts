import ts from "typescript";
import { ProtoEnum, ProtoMessage } from "../protoTypes";
import { getUnwrapFunc } from "./unwrap";
import {
  compact,
  createImportAllWithAliastDecl,
  protoImportPath,
  uniq,
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
        compact([
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
        ])
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
  const unwrapFuncImports = uniq(
    msgs
      .flatMap((m) => m.fields)
      .flatMap((f) => getUnwrapFunc(f)?.imports ?? [])
  );

  return unwrapFuncImports.map(createImportAllWithAliastDecl);
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
  return uniq(msgs.map((m) => protoImportPath(m, opts))).map(
    createImportAllWithAliastDecl
  );
}
