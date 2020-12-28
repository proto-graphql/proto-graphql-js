import ts from "typescript";
import { ProtoMessage, ProtoOneof } from "../protoTypes";
import { GenerationParams } from "./types";
import {
  createProtoQualifiedName,
  isIgnoredField,
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
  opts: GenerationParams
): ts.Statement[] {
  const stmts = types
    .map((t) => createReExportProtoStmt(t, opts))
    .filter(onlyNonNull());

  if (opts.useProtobufjs) {
    stmts.push(
      ...types
        .flatMap((m) => m.oneofs)
        .filter((o) => !isIgnoredField(o))
        .map((o) => createReExportOneofUnionSourceStmt(o, opts))
    );
  }

  return stmts;
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
function createReExportProtoStmt(
  typ: ProtoMessage,
  opts: GenerationParams
): ts.Statement {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    protoExportAlias(typ, opts),
    undefined,
    ts.factory.createTypeReferenceNode(createProtoQualifiedName(typ, opts))
  );
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
function createReExportOneofUnionSourceStmt(
  o: ProtoOneof,
  opts: GenerationParams
): ts.Statement {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    protoExportAlias(o, opts),
    undefined,
    ts.factory.createUnionTypeNode(
      o.fields.map((f) => {
        const type = f.type as ProtoMessage;
        return ts.factory.createParenthesizedType(
          ts.factory.createIntersectionTypeNode([
            ts.factory.createTypeReferenceNode(
              // TODO: throw error when f.type is not message
              createProtoQualifiedName(type, opts)
            ),
            ts.factory.createTypeLiteralNode([
              ts.factory.createPropertySignature(
                undefined,
                "__protobufTypeName",
                undefined,
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(type.qualifiedName)
                )
              ),
            ]),
          ])
        );
      })
    )
  );
}
