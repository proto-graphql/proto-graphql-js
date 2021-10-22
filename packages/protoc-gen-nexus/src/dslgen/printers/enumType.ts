import ts from "typescript";
import { EnumType, EnumTypeValue } from "../types";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createNexusCallExpr,
  createProtoNexusType,
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
      ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(ev.name)),
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
  const objExpr = ts.factory.createObjectLiteralExpression(
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

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createSpreadAssignment(
        ts.factory.createParenthesizedExpression(
          ts.factory.createAsExpression(
            objExpr,
            ts.factory.createTypeReferenceNode(createProtoNexusType("ProtobufEnumExtensions"))
          )
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
  const objExpr = ts.factory.createObjectLiteralExpression(
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

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createSpreadAssignment(
        ts.factory.createParenthesizedExpression(
          ts.factory.createAsExpression(
            objExpr,
            ts.factory.createTypeReferenceNode(createProtoNexusType("ProtobufEnumValueExtensions"))
          )
        )
      ),
    ],
    true
  );
}
