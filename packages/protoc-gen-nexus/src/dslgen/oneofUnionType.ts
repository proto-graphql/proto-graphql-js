import ts from "typescript";
import { ProtoMessage, ProtoOneof, ProtoRegistry } from "../protoTypes";
import { detectGqlType, GenerationParams } from "./types";
import {
  createDslExportConstStmt,
  createProtoExpr,
  gqlTypeName,
  onlyNonNull,
  protoExportAlias,
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
  opts: GenerationParams
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
  opts: GenerationParams
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
            opts.useProtobufjs
              ? ts.factory.createPropertyAssignment(
                  "sourceType",
                  sourceTypeExpr(oneof, opts)
                )
              : null,
          ].filter(onlyNonNull()),
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
  opts: GenerationParams
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
          .map((t) => craeteOneofUnionTypeResolveTypeMethodStatement(t, opts)),
        ts.factory.createThrowStatement(
          // TODO: throw custom error
          ts.factory.createStringLiteral("unreachable")
        ),
      ],
      true
    )
  );
}
function craeteOneofUnionTypeResolveTypeMethodStatement(
  t: ProtoMessage,
  opts: GenerationParams
) {
  if (opts.useProtobufjs) {
    return ts.factory.createIfStatement(
      ts.factory.createBinaryExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier("item"),
          "__protobufTypeName"
        ),
        ts.SyntaxKind.EqualsEqualsEqualsToken,
        ts.factory.createStringLiteral(t.qualifiedName)
      ),
      ts.factory.createBlock([
        ts.factory.createReturnStatement(
          ts.factory.createStringLiteral(gqlTypeName(t))
        ),
      ])
    );
  }
  return ts.factory.createIfStatement(
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
function sourceTypeExpr(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.Expression {
  return ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment(
      "module",
      ts.factory.createIdentifier("__filename")
    ),
    ts.factory.createPropertyAssignment(
      "export",
      ts.factory.createStringLiteral(protoExportAlias(oneof, opts))
    ),
  ]);
}
