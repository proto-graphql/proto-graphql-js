import ts from "typescript";
import { ProtoEnum, ProtoMessage } from "../protogen";
import { GenerationParams } from "./types";
import { getUnwrapFunc } from "./unwrap";
import {
  createImportAllWithAliastDecl,
  getEnumValueForUnspecified,
  isIgnoredField,
  onlyUnique,
  protoImportPath,
} from "./util";

/**
 * @example
 * ```ts
 * import * as nexus from "nexus";
 * ```
 */
export function createImportNexusDecl(): ts.ImportDeclaration {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamespaceImport(ts.factory.createIdentifier("nexus"))
    ),
    ts.factory.createStringLiteral("nexus")
  );
}

/**
 * @example
 * ```
 * import * as proto_nexus from "proto-nexus";
 * ```
 */
export function createImportUnwrapFuncDecls(
  msgs: ReadonlyArray<ProtoMessage>,
  opts: GenerationParams
): ts.ImportDeclaration[] {
  return msgs
    .flatMap((m) => m.fields)
    .flatMap((f) => getUnwrapFunc(f, opts)?.imports ?? [])
    .filter(onlyUnique())
    .map(createImportAllWithAliastDecl);
}

/**
 * @example js_out
 * ```
 * import * as _$hello$hello_pb from "./hello/hello_pb";
 * ```
 *
 * @example protobufjs
 * ```
 * import * as _$hello from "./hello";
 * ```
 */
export function createImportProtoDecls(
  msgs: ReadonlyArray<ProtoMessage>,
  opts: GenerationParams
): ts.ImportDeclaration[] {
  return [
    ...msgs.map((m) => protoImportPath(m, opts)),
    ...msgs
      .flatMap((m) =>
        m.fields
          .filter((f) => !isIgnoredField(f))
          .map((f) => f.type)
          .filter((t): t is ProtoEnum => t != null && t.kind === "Enum" && getEnumValueForUnspecified(t) != null)
      )
      .map((e) => protoImportPath(e, opts)),
  ]
    .filter(onlyUnique())
    .map(createImportAllWithAliastDecl);
}
