import ts from "typescript";
import { EnumType, EnumTypeValue } from "../types";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Hello = enumType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createEnumTypeDslStmt(type: EnumType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createNexusCallExpr("enumType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "members",
            ts.factory.createArrayLiteralExpression(
              type.values.filter((v) => !v.isIgnored() && !v.isUnespecified()).map(createEnumValueExpr),
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
      ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(ev.name)),
      createDescriptionPropertyAssignment(ev),
      createDeprecationPropertyAssignment(ev),
      ts.factory.createPropertyAssignment("value", ts.factory.createNumericLiteral(ev.number)),
    ].filter(onlyNonNull()),
    true // multiline
  );
}
