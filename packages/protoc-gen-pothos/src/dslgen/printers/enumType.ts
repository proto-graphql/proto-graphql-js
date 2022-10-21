import ts from "typescript";
import { EnumType, EnumTypeValue } from "@proto-graphql/codegen-core";
import {
  createBuilderCallExpr,
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Hello = builder.enumType("Hello", {
 *   // ...
 * })
 * ```
 */
export function createEnumTypeDslStmt(type: EnumType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createBuilderCallExpr("enumType", [
      ts.factory.createStringLiteral(type.typeName),
      ts.factory.createObjectLiteralExpression(
        [
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "values",
            ts.factory.createObjectLiteralExpression(
              type.values
                .filter((v) => !v.isIgnored() && !v.isUnespecified())
                .map((ev) => ts.factory.createPropertyAssignment(ev.name, createEnumValueExpr(ev))),
              true // multiline
            )
          ),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}

function createEnumValueExpr(ev: EnumTypeValue): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      createDescriptionPropertyAssignment(ev),
      createDeprecationPropertyAssignment(ev),
      ts.factory.createPropertyAssignment("value", ts.factory.createNumericLiteral(ev.number)),
    ].filter(onlyNonNull()),
    true // multiline
  );
}
