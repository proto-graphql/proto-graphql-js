import ts from "typescript";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createFullNameExpr,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";
import { createFieldResolverDecl } from "./fieldResolvers";
import { InputObjectField, ObjectField, ObjectOneofField } from "../types";

/**
 * @example
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createFieldDefinitionStmt(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
      undefined,
      [ts.factory.createStringLiteral(field.name), createFieldOptionExpr(field)]
    )
  );
}

export function createNoopFieldDefinitionStmt(opts: { input: boolean }): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
      undefined,
      [
        ts.factory.createStringLiteral("_"),
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("Boolean")),
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
    )
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
  let typeExpr: ts.Expression =
    field.shouldReferenceTypeWithString() || !field.typeFullName
      ? ts.factory.createStringLiteral(field.type.typeName)
      : createFullNameExpr(field.typeFullName);

  if (field.isList()) {
    typeExpr = createNexusCallExpr("nonNull", [typeExpr]);
    typeExpr = createNexusCallExpr("list", [typeExpr]);
    typeExpr = createNexusCallExpr("nonNull", [typeExpr]);
  } else {
    typeExpr = createNexusCallExpr(field.isNullable() ? "nullable" : "nonNull", [typeExpr]);
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", typeExpr),
      createDescriptionPropertyAssignment(field),
      createDeprecationPropertyAssignment(field),
      field instanceof InputObjectField ? null : createFieldResolverDecl(field),
    ].filter(onlyNonNull()),
    true
  );
}
