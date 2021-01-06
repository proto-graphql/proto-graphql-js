import ts from "typescript";
import { ProtoMessage } from "../protogen";
import { GenerationParams } from "./types";
import { createProtoQualifiedName, onlyNonNull, protoExportAlias } from "./util";

/**
 * @example
 * ```
 * export _$hello$hello_pb$Hello = _$hello$hello_pb.Hello;
 * ```
 */
export function createReExportProtoStmts(types: ReadonlyArray<ProtoMessage>, opts: GenerationParams): ts.Statement[] {
  return types.map((t) => createReExportProtoStmt(t, opts)).filter(onlyNonNull());
}

/**
 * @example js_out
 * ```
 * export _$hello$hello_pb$Hello = _$hello$hello_pb.Hello;
 * ```
 *
 * @example protobufjs
 * ```
 * export _$hello$hello$Hello = _$hello.hello.Hello;
 * ```
 */
function createReExportProtoStmt(typ: ProtoMessage, opts: GenerationParams): ts.Statement {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    protoExportAlias(typ, opts),
    undefined,
    ts.factory.createTypeReferenceNode(createProtoQualifiedName(typ, opts))
  );
}
