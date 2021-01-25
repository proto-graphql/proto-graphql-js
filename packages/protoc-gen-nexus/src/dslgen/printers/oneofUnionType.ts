import ts from "typescript";
import { OneofUnionType, SquashedOneofUnionType } from "../types";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createNexusCallExpr,
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
export function createOneofUnionTypeDslStmt(type: OneofUnionType | SquashedOneofUnionType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createNexusCallExpr("unionType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
          createDescriptionPropertyAssignment(type),
          createOneofUnionTypeDefinitionMethodDecl(type),
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
function createOneofUnionTypeDefinitionMethodDecl(type: OneofUnionType | SquashedOneofUnionType): ts.MethodDeclaration {
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
            type.fields.map((f) => ts.factory.createStringLiteral(f.type.typeName))
          )
        ),
      ],
      true
    )
  );
}
