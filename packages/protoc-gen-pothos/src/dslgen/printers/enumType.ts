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
    type.pothosRefObjectName,
    createBuilderCallExpr("enumType", [
      ts.factory.createStringLiteral(type.typeName),
      ts.factory.createObjectLiteralExpression(
        [
          createDescriptionPropertyAssignment(type),
          ts.factory.createPropertyAssignment(
            "values",
            ts.factory.createAsExpression(
              ts.factory.createObjectLiteralExpression(
                type.values
                  .filter((v) => !v.isIgnored() && !v.isUnespecified())
                  .map((ev) => ts.factory.createPropertyAssignment(ev.name, createEnumValueExpr(ev))),
                true // multiline
              ),
              ts.factory.createTypeReferenceNode("const")
            )
          ),
          ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
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
      ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExprForEnumValue(ev)),
    ].filter(onlyNonNull()),
    true // multiline
  );
}

/**
 * @example
 * ```ts
 * {{
 *   protobufEnum: {
 *     name: "...",
 *     fullName: "...",
 *     package: "...",
 *   },
 * } as ProtobufEnumExtensions)
 * ```
 */
function createExtensionsObjectLiteralExpr(type: EnumType): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufEnum",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.proto.name)),
            ts.factory.createPropertyAssignment(
              "fullName",
              ts.factory.createStringLiteral(type.proto.fullName.toString())
            ),
            ts.factory.createPropertyAssignment("package", ts.factory.createStringLiteral(type.proto.file.package)),
          ],
          true
        )
      ),
    ],
    true
  );
}

/**
 * @example
 * ```ts
 * ({
 *   protobufEnumValue: {
 *     name: "...",
 *   },
 * } as ProtobufEnumValueExtensions)
 * ```
 */
function createExtensionsObjectLiteralExprForEnumValue(ev: EnumTypeValue): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufEnumValue",
        ts.factory.createObjectLiteralExpression(
          [ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(ev.proto.name))],
          true
        )
      ),
    ],
    true
  );
}
