import ts from "typescript";
import { ProtoEnum, ProtoEnumValue } from "../protoTypes";
import {
  createDeprecationPropertyAssignment,
  createDslExportConstStmt,
  gqlTypeName,
  isEnumValueForUnspecified,
  isIgnoredField,
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
export function createEnumTypeDslStmts(
  enums: ReadonlyArray<ProtoEnum>
): ts.Statement[] {
  return enums.map(createEnumTypeDslStmt);
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
    ts.factory.createCallExpression(
      ts.factory.createIdentifier("enumType"),
      undefined,
      [
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "name",
              ts.factory.createStringLiteral(typeName)
            ),
            ts.factory.createPropertyAssignment(
              "description",
              ts.factory.createStringLiteral(en.description)
            ),
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
          ],
          true
        ),
      ]
    )
  );
}

function createEnumValueExpr(ev: ProtoEnumValue): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "name",
        ts.factory.createStringLiteral(ev.name)
      ),
      ev.description
        ? ts.factory.createPropertyAssignment(
            "description",
            ts.factory.createStringLiteral(ev.description)
          )
        : null,
      createDeprecationPropertyAssignment(ev),
      ts.factory.createPropertyAssignment(
        "value",
        ts.factory.createNumericLiteral(ev.tagNumber)
      ),
    ].filter(onlyNonNull()),
    true // multiline
  );
}
