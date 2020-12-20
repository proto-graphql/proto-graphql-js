import ts from "typescript";
import { ProtoMessage, ProtoOneof, ProtoRegistry } from "../protoTypes";
import { detectGqlType } from "./types";
import {
  createDslExportConstStmt,
  createProtoExpr,
  gqlTypeName,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = unionType({
 *   name: "Oneof",
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeDslStmts(
  msgs: ReadonlyArray<ProtoMessage>,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement[] {
  return msgs
    .flatMap((m) => m.oneofs)
    .map((o) => createOneofUnionTypeDslStmt(o, reg, opts));
}

/**
 * @example
 * ```ts
 * export cosnt Oneof = unionType({
 *   name: "Oneof",
 *   // ...
 * })
 * ```
 */
function createOneofUnionTypeDslStmt(
  oneof: ProtoOneof,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement {
  const typeName = gqlTypeName(oneof);
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(
      ts.factory.createIdentifier("unionType"),
      undefined,
      [
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "name",
              ts.factory.createStringLiteral(typeName)
            ),
            ts.factory.createPropertyAssignment(
              "description",
              ts.factory.createStringLiteral(oneof.description)
            ),
            createOneofUnionTypeDefinitionMethodDecl(oneof, reg),
            createOneofUnionTypeResolveTypeMethodDecl(oneof, reg, opts),
          ],
          true
        ),
      ]
    )
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
function createOneofUnionTypeDefinitionMethodDecl(
  oneof: ProtoOneof,
  reg: ProtoRegistry
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "definition",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "t",
        undefined,
        undefined,
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("t"),
              ts.factory.createIdentifier("members")
            ),
            undefined,
            oneof.fields
              .map((f) => detectGqlType(f, reg))
              .map((t) => (t.kind === "object" ? t.type : null))
              .filter(onlyNonNull())
              .map((t) => ts.factory.createStringLiteral(t))
          )
        ),
      ],
      true
    )
  );
}

/**
 * @example
 * ```ts
 * resolveType(item) {
 *   // ...
 * }
 * ```
 */
function createOneofUnionTypeResolveTypeMethodDecl(
  oneof: ProtoOneof,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "resolveType",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "item",
        undefined,
        undefined,
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ...oneof.fields
          .map((f) => reg.findByFieldDescriptor(f.descriptor))
          // TODO: throw error when `t` is unallowed type
          .filter((t): t is ProtoMessage => t instanceof ProtoMessage)
          .map((t) =>
            ts.factory.createIfStatement(
              ts.factory.createBinaryExpression(
                ts.factory.createIdentifier("item"),
                ts.SyntaxKind.InstanceOfKeyword,
                createProtoExpr(t, opts)
              ),
              ts.factory.createBlock([
                ts.factory.createReturnStatement(
                  ts.factory.createStringLiteral(gqlTypeName(t))
                ),
              ])
            )
          ),
        ts.factory.createThrowStatement(
          // TODO: throw custom error
          ts.factory.createStringLiteral("unreachable")
        ),
      ],
      true
    )
  );
}
