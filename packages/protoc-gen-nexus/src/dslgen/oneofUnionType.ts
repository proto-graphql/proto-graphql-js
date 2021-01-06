import ts from "typescript";
import { ProtoMessage, ProtoOneof, ProtoRegistry } from "../protogen";
import { detectGqlType } from "./types";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  gqlTypeName,
  isIgnoredField,
  isInputOnlyField,
  isSquashedUnion,
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
export function createOneofUnionTypeDslStmts(msgs: ReadonlyArray<ProtoMessage>, reg: ProtoRegistry): ts.Statement[] {
  return [
    ...msgs
      .filter((m) => !isSquashedUnion(m))
      .flatMap((m) => m.oneofs)
      .filter((o) => !isIgnoredField(o))
      .map((o) => createOneofUnionTypeDslStmt(gqlTypeName(o), o, reg)),
    ...msgs
      .filter((m) => isSquashedUnion(m))
      .map((m) => m.oneofs[0])
      .filter((o) => !isIgnoredField(o))
      .map((o) => createOneofUnionTypeDslStmt(gqlTypeName(o.parent), o, reg)),
  ];
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
function createOneofUnionTypeDslStmt(typeName: string, oneof: ProtoOneof, reg: ProtoRegistry): ts.Statement {
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(ts.factory.createIdentifier("unionType"), undefined, [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(typeName)),
          createDescriptionPropertyAssignment(oneof),
          createOneofUnionTypeDefinitionMethodDecl(oneof, reg),
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
function createOneofUnionTypeDefinitionMethodDecl(oneof: ProtoOneof, reg: ProtoRegistry): ts.MethodDeclaration {
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
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("t"),
              ts.factory.createIdentifier("members")
            ),
            undefined,
            oneof.fields
              .filter((f) => !isIgnoredField(f))
              .filter((f) => !isInputOnlyField(f))
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
