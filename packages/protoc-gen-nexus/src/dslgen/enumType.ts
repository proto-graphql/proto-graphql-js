import ts from "typescript";
import { ProtoEnum, ProtoEnumValue } from "../protogen";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createNexusCallExpr,
  gqlTypeName,
  isEnumValueForUnspecified,
  isIgnoredField,
  isIgnoredType,
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
export function createEnumTypeDslStmts(enums: ReadonlyArray<ProtoEnum>): ts.Statement[] {
  return enums.filter((e) => !isIgnoredType(e)).map(createEnumTypeDslStmt);
}

/**
 * @example
 * ```ts
 * export cosnt Hello = enumType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
function createEnumTypeDslStmt(en: ProtoEnum): ts.Statement {
  const typeName = gqlTypeName(en);
  return createDslExportConstStmt(
    typeName,
    createNexusCallExpr("enumType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(typeName)),
          createDescriptionPropertyAssignment(en),
          ts.factory.createPropertyAssignment(
            "members",
            ts.factory.createArrayLiteralExpression(
              en.values
                .filter((ev) => !isEnumValueForUnspecified(ev))
                .filter((ev) => !isIgnoredField(ev))
                .map(createEnumValueExpr),
              true // multiline
            )
          ),
        ].filter(onlyNonNull()),
        true
      ),
    ])
  );
}

function createEnumValueExpr(ev: ProtoEnumValue): ts.Expression {
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
