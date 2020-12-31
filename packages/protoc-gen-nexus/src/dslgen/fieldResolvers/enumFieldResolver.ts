import ts from "typescript";
import { ProtoEnum, ProtoField } from "../../protoTypes";
import { GenerationParams, GqlType } from "../types";
import {
  createProtoExpr,
  getEnumValueForUnspecified,
  gqlTypeName,
  onlyNonNull,
} from "../util";

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
  field: ProtoField,
  type: GqlType,
  en: ProtoEnum,
  opts: GenerationParams
): ts.Statement[] {
  let whenNullStmt: ts.Statement = type.nullable
    ? ts.factory.createReturnStatement(
        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
      )
    : ts.factory.createThrowStatement(
        ts.factory.createNewExpression(
          ts.factory.createIdentifier("Error"),
          undefined,
          [
            ts.factory.createStringLiteral(
              `${gqlTypeName(field.parent)}.${
                field.name
              } is required field. But got null or unspecified.`
            ),
          ]
        )
      );
  whenNullStmt = ts.factory.createBlock(
    [whenNullStmt],
    true // multiline
  );
  const unspecified = getEnumValueForUnspecified(en);

  return [
    unspecified
      ? ts.factory.createIfStatement(
          ts.factory.createBinaryExpression(
            valueExpr,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.factory.createPropertyAccessExpression(
              createProtoExpr(field.type!, opts),
              ts.factory.createIdentifier(unspecified.name)
            )
          ),
          whenNullStmt
        )
      : null,
    ts.factory.createReturnStatement(valueExpr),
  ].filter(onlyNonNull());
}
