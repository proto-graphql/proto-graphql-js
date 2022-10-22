import { OneofUnionType, SquashedOneofUnionType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import {
  createBuilderCallExpr,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = builder.unionType("Oneof", {
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeDslStmt(type: OneofUnionType | SquashedOneofUnionType): ts.Statement {
  return createDslExportConstStmt(
    type.pothosRefObjectName,
    createBuilderCallExpr("unionType", [
      ts.factory.createStringLiteral(type.typeName),
      ts.factory.createObjectLiteralExpression(
        [
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "types",
            ts.factory.createArrayLiteralExpression(
              type.fields.map((f) => ts.factory.createIdentifier(f.type.pothosRefObjectName)),
              true
            )
          ),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}
