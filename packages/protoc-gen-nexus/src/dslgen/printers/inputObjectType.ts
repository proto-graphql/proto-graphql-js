import ts from "typescript";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";
import { createFieldDefinitionStmt } from "./field";
import { InputObjectType } from "../types";

/**
 * @example
 * ```ts
 * export cosnt Hello = inputObjectType({
 *   name: "HelloInput",
 *   // ...
 * })
 * ```
 */
export function createInputObjectTypeDslStmt(type: InputObjectType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createNexusCallExpr("inputObjectType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
          createDescriptionPropertyAssignment(type),
          createInputObjectTypeDefinitionMethodDecl(type),
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
function createInputObjectTypeDefinitionMethodDecl(type: InputObjectType): ts.MethodDeclaration {
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
      type.fields.map((f) => createFieldDefinitionStmt(f)),
      true
    )
  );
}
