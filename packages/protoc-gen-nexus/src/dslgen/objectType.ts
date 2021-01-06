import ts from "typescript";
import { ProtoMessage, ProtoRegistry } from "../protogen";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createProtoExpr,
  exceptRequestOrResponse,
  gqlTypeName,
  isIgnoredField,
  isIgnoredType,
  isInputOnlyField,
  isSquashedUnion,
  onlyNonNull,
  protoExportAlias,
} from "./util";
import { createFieldDefinitionStmt } from "./field";
import { createOneofFieldDefinitionStmt } from "./oneofField";
import { GenerationParams } from "./types";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeDslStmts(
  msgs: ReadonlyArray<ProtoMessage>,
  reg: ProtoRegistry,
  opts: GenerationParams
): ts.Statement[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter(exceptRequestOrResponse(reg))
    .map((m) => createObjectTypeDslStmt(m, reg, opts));
}

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
function createObjectTypeDslStmt(msg: ProtoMessage, reg: ProtoRegistry, opts: GenerationParams): ts.Statement {
  const typeName = gqlTypeName(msg);
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(ts.factory.createIdentifier("objectType"), undefined, [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(typeName)),
          createDescriptionPropertyAssignment(msg),
          createObjectTypeDefinitionMethodDecl(msg, reg, opts),
          createIsTypeOfMethodDecl(msg, opts),
          ts.factory.createPropertyAssignment("sourceType", sourceTypeExpr(msg, opts)),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}

/**
 * @example
 * ```ts
 * definition(t) {
 *   // ...
 * }
 * ```
 */
function createObjectTypeDefinitionMethodDecl(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: GenerationParams
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "definition",
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createBlock(
      [
        ...msg.fields
          .filter((f) => f.containingOneof == null)
          .filter((f) => !isInputOnlyField(f))
          .filter((f) => !isIgnoredField(f))
          .map((f) => createFieldDefinitionStmt(f, reg, opts)),
        ...msg.oneofs
          .filter((f) => !isInputOnlyField(f))
          .filter((f) => !isIgnoredField(f))
          .map((o) => createOneofFieldDefinitionStmt(o, opts)),
      ],
      true
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   module: __filename,
 *   export: "_$hello$hello_pb$User"
 * }
 * ```
 */
function sourceTypeExpr(msg: ProtoMessage, opts: GenerationParams): ts.Expression {
  return ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment("module", ts.factory.createIdentifier("__filename")),
    ts.factory.createPropertyAssignment("export", ts.factory.createStringLiteral(protoExportAlias(msg, opts))),
  ]);
}

/**
 * @example
 * ```ts
 * isTypeOf(data) {
 *   return data instanceof _$hello$hello_pb.Hello;
 * }
 * ```
 */
function createIsTypeOfMethodDecl(msg: ProtoMessage, opts: GenerationParams): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "isTypeOf",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "data",
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createIdentifier("data"),
            ts.SyntaxKind.InstanceOfKeyword,
            createProtoExpr(msg, opts)
          )
        ),
      ],
      true
    )
  );
}
