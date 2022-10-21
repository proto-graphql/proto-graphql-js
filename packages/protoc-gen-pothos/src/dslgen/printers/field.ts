import { InputObjectField, ObjectField, ObjectOneofField } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createDeprecationPropertyAssignment, createDescriptionPropertyAssignment, onlyNonNull } from "./util";

/**
 * @example
 * ```ts
 * t.expose("name", {
 *   // ...
 * })
 * ```
 */
export function createFieldDefinitionExpr(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("expose")),
    undefined,
    [ts.factory.createStringLiteral(field.protoJsName), createFieldOptionExpr(field)]
  );
}

/**
 * @example
 * ```ts
 * t.field( {
 *   type: "Boolean",
 *   nullable: true,
 *   description: "noop field",
 *   resolve() {
 *     return true
 *   }
 * })
 * ```
 */
export function createNoopFieldDefinitionExpr(opts: { input: boolean }): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
    undefined,
    [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("Boolean")),
          ts.factory.createPropertyAssignment("nullable", ts.factory.createToken(ts.SyntaxKind.TrueKeyword)),
          ts.factory.createPropertyAssignment("description", ts.factory.createStringLiteral("noop field")),
          opts.input
            ? null
            : ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                undefined,
                "resolve",
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createBlock([
                  ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.TrueKeyword)),
                ])
              ),
        ].filter(onlyNonNull()),
        true
      ),
    ]
  );
}

/**
 * @example
 * ```ts
 * {
 *   description: '...',
 *   type: '...',
 *   resolve(root) {
 *     // ...
 *   }
 * }
 * ```
 */
export function createFieldOptionExpr(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): ts.Expression {
  let typeExpr: ts.Expression = ts.factory.createStringLiteral(field.type.typeName);
  let nullableExpr: ts.Expression = field.isNullable()
    ? ts.factory.createToken(ts.SyntaxKind.TrueKeyword)
    : ts.factory.createToken(ts.SyntaxKind.FalseKeyword);

  if (field.isList()) {
    typeExpr = ts.factory.createArrayLiteralExpression([typeExpr], false);
    nullableExpr = ts.factory.createObjectLiteralExpression(
      [
        ts.factory.createPropertyAssignment("list", nullableExpr),
        ts.factory.createPropertyAssignment("item", ts.factory.createToken(ts.SyntaxKind.FalseKeyword)),
      ],
      false
    );
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", typeExpr),
      ts.factory.createPropertyAssignment("nullable", nullableExpr),
      createDescriptionPropertyAssignment(field),
      createDeprecationPropertyAssignment(field),
    ].filter(onlyNonNull()),
    true
  );
}
