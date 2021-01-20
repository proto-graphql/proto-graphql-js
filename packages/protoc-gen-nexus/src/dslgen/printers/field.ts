import ts from "typescript";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";
import { createFieldResolverDecl } from "./fieldResolvers";
import { GqlType, InputObjectField, ObjectField } from "../types";

/**
 * @example
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createFieldDefinitionStmt(field: ObjectField<any, any> | InputObjectField<GqlType>): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
      undefined,
      [ts.factory.createStringLiteral(field.name), createFieldOptionExpr(field)]
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
function createFieldOptionExpr(field: ObjectField<any, GqlType> | InputObjectField<GqlType>): ts.Expression {
  let typeExpr: ts.Expression = createNexusCallExpr(field.isNullable() ? "nullable" : "nonNull", [
    ts.factory.createStringLiteral(field.type.typeName),
  ]);
  if (field.isList()) {
    typeExpr = createNexusCallExpr("list", [typeExpr]);
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", typeExpr),
      createDescriptionPropertyAssignment(field),
      createDeprecationPropertyAssignment(field),
      field instanceof ObjectField ? createFieldResolverDecl(field) : null,
    ].filter(onlyNonNull()),
    true
  );
}
