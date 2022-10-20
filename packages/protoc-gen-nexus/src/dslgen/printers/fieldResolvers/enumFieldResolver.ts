import { EnumType, EnumTypeValue, ObjectField } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createFullNameExpr, onlyNonNull } from "../util";
import { createMapExpr } from "./utils";

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
export function createEnumFieldResolverStmts(valueExpr: ts.Expression, field: ObjectField<EnumType>): ts.Statement[] {
  let whenNullStmt: ts.Statement =
    field.isNullable() && !field.isList()
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

  if (field.isList()) {
    const guardStmts = createGuardStmts(
      ts.factory.createIdentifier("item"),
      whenNullStmt,
      field.type.unspecifiedValue,
      field.type.valuesWithIgnored
    );
    if (guardStmts.length === 0) {
      return [ts.factory.createReturnStatement(valueExpr)];
    }
    return [
      ts.factory.createReturnStatement(
        createMapExpr(valueExpr, (itemExpr) => [...guardStmts, ts.factory.createReturnStatement(itemExpr)])
      ),
    ];
  }

  return [
    ...createGuardStmts(valueExpr, whenNullStmt, field.type.unspecifiedValue, field.type.valuesWithIgnored),
    ts.factory.createReturnStatement(valueExpr),
  ];
}

function createGuardStmts(
  valueExpr: ts.Expression,
  thenStmt: ts.Statement,
  unspecifiedValue: EnumTypeValue | null,
  ignoredValues: EnumTypeValue[]
): ts.Statement[] {
  return [
    unspecifiedValue
      ? ts.factory.createIfStatement(
          ts.factory.createBinaryExpression(
            valueExpr,
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            createFullNameExpr(unspecifiedValue.fullName)
          ),
          thenStmt
        )
      : null,
    ...ignoredValues.map((ev) =>
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
  ].filter(onlyNonNull());
}
