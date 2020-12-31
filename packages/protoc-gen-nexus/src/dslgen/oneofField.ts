import ts from "typescript";
import { ProtoOneof } from "../protoTypes";
import {
  createDeprecationPropertyAssignment,
  gqlTypeName,
  isRequiredField,
  onlyNonNull,
} from "./util";
import { GenerationParams } from "./types";
import { createOneofFieldResolverDecl } from "./fieldResolvers";

/**
 * @example
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createOneofFieldDefinitionStmt(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("t"),
        ts.factory.createIdentifier("field")
      ),
      undefined,
      [
        ts.factory.createStringLiteral(oneof.name),
        createOneofFieldOptionExpr(oneof, opts),
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
function createOneofFieldOptionExpr(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.Expression {
  const nullable = !isRequiredField(oneof);
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(nullable ? "nullable" : "nonNull"),
          undefined,
          [ts.factory.createStringLiteral(gqlTypeName(oneof))]
        )
      ),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(oneof.description)
      ),
      createDeprecationPropertyAssignment(oneof),
      createOneofFieldResolverDecl(oneof, opts),
    ].filter(onlyNonNull()),
    true
  );
}
