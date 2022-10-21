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
 *   name: "Oneof",
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeDslStmt(type: OneofUnionType | SquashedOneofUnionType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createBuilderCallExpr("unionType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "types",
            ts.factory.createArrayLiteralExpression(
              type.fields.map((f) => ts.factory.createStringLiteral(f.type.typeName)),
              true
            )
          ),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}
