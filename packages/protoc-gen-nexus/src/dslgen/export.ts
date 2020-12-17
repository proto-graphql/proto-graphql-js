import ts from "typescript";
import { ProtoMessage } from "../protoTypes";
import {
  createProtoQualifiedName,
  onlyNonNull,
  protoExportAlias,
} from "./util";

/**
 * @example
 * ```
 * export _$hello$hello_pb$Hello = _$hello$hello_pb.Hello;
 * ```
 */
export function createReExportProtoStmts(
  types: ReadonlyArray<ProtoMessage>,
  opts: { importPrefix?: string }
): ts.Statement[] {
  return types
    .map((t) => createReExportProtoStmt(t, opts))
    .filter(onlyNonNull());
}

/**
 * @example
 * ```
 * export _$hello$hello_pb$Hello = _$hello$hello_pb.Hello;
 * ```
 */
function createReExportProtoStmt(
  typ: ProtoMessage,
  opts: { importPrefix?: string }
): ts.Statement {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    protoExportAlias(typ, opts),
    undefined,
    ts.factory.createTypeReferenceNode(createProtoQualifiedName(typ, opts))
  );
}
