import ts from "typescript";
import { createFullNameExpr, onlyNonNull } from "../util";
import { ObjectField, EnumType } from "../../types";
import { ProtoField } from "../../../protogen";

/**
 * @example nullable
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   return null
 * }
 * return root.myEnum
 * ```
 * @example notNull
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   throw new Error("Message.field is required field. but got null or unspecified.")
 * }
 * return root.myEnum
 * ```
 */
export function createEnumFieldResolverStmts(
  valueExpr: ts.Expression,
  field: ObjectField<ProtoField, EnumType>
): ts.Statement[] {
  let whenNullStmt: ts.Statement = field.isNullable()
    ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
    : ts.factory.createThrowStatement(
        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
          ts.factory.createStringLiteral(`${field.name} is required field. But got unspecified.`),
        ])
      );
  whenNullStmt = ts.factory.createBlock(
    [whenNullStmt],
    true // multiline
  );

  return [
    field.type.unspecifiedValue
      ? ts.factory.createIfStatement(
          ts.factory.createBinaryExpression(
            valueExpr,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            createFullNameExpr(field.type.unspecifiedValue.fullName)
          ),
          whenNullStmt
        )
      : null,
    ...field.type.valuesWithIgnored.map((ev) =>
      ev.isIgnored()
        ? ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              valueExpr,
              ts.SyntaxKind.EqualsEqualsEqualsToken,
              createFullNameExpr(ev.fullName)
            ),
            ts.factory.createBlock(
              [
                ts.factory.createThrowStatement(
                  ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                    ts.factory.createStringLiteral(`${ev.name} is ignored in GraphQL schema`),
                  ])
                ),
              ],
              true // multiline
            )
          )
        : null
    ),
    ts.factory.createReturnStatement(valueExpr),
  ].filter(onlyNonNull());
}
