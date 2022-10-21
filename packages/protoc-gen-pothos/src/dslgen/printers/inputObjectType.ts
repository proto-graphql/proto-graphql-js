import { InputObjectType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createFieldDefinitionExpr, createNoopFieldDefinitionExpr } from "./field";
import {
  createBuilderPropExpr,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createQualifiedName,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export const HelloInput = builder.inputRef<Omit<_$hello$hello_pb.Hello, "$type">>("HelloInput");
 * HelloInput.implement({
 *   description: "...",
 *   fields: (t) => ({
 *     // ...
 *   }),
 * })
 * ```
 */
export function createInputObjectTypeDslStmts(type: InputObjectType): ts.Statement[] {
  return [
    createDslExportConstStmt(
      type.typeName,
      ts.factory.createCallExpression(
        createBuilderPropExpr("inputRef"),
        [
          ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Omit"), [
            ts.factory.createTypeReferenceNode(createQualifiedName(type.protoTypeFullName)),
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("$type")),
          ]),
        ],
        [ts.factory.createStringLiteral(type.typeName)]
      )
    ),
    ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(type.typeName), "implement"),
        undefined,
        [
          ts.factory.createObjectLiteralExpression(
            [
              createDescriptionPropertyAssignment(type),
              ts.factory.createPropertyAssignment("fields", createInputObjectTypeFieldsMethodExpr(type)),
              // ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
            ].filter(onlyNonNull()),
            true
          ),
        ]
      )
    ),
  ];
}

/**
 * @example
 * ```ts
 * definition(t) {
 *   // ...
 * }
 * ```
 */
function createInputObjectTypeFieldsMethodExpr(type: InputObjectType): ts.Expression {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createParenthesizedExpression(
      ts.factory.createObjectLiteralExpression(
        type.fields.length > 0
          ? type.fields.map((f) => ts.factory.createPropertyAssignment(f.name, createFieldDefinitionExpr(f)))
          : [ts.factory.createPropertyAssignment("_", createNoopFieldDefinitionExpr({ input: true }))],
        true
      )
    )
  );
}
