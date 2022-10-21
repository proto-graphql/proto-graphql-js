import { ObjectField, ObjectOneofField, SquashedOneofUnionType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { onlyNonNull } from "../util";

/**
 * @example nullable
 * ```ts
 * const value = source.v1 ?? source.v2 ?? source.v3;
 * if (value != null) {
 *   throw new Error("...");
 * }
 * return value
 * ```
 */
export function createOneofUnionResolverStmts(
  sourceExpr: ts.Expression,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>
): ts.Statement[] {
  const createResolverStmts = (
    sourceExpr: ts.Expression,
    field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
    { nullable }: { nullable: boolean }
  ) => {
    const createFieldExpr = (memberField: ObjectField<any>) => {
      if (field instanceof ObjectOneofField) {
        return ts.factory.createPropertyAccessExpression(sourceExpr, memberField.protoJsName);
      }
      return ts.factory.createPropertyAccessChain(
        sourceExpr,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        memberField.protoJsName
      );
    };
    const valueExpr = ts.factory.createIdentifier("value");

    return [
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              "value",
              undefined,
              undefined,
              // obj.field1 ?? obj.field2 ?? obj.field3 ?? ...
              field.type.fields.reduceRight<ts.Expression>((expr, field) => {
                if (expr == null) {
                  return createFieldExpr(field);
                }
                return ts.factory.createBinaryExpression(
                  createFieldExpr(field),
                  ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                  expr
                );
              }, null as any)
            ),
          ],
          ts.NodeFlags.Const
        )
      ),
      nullable
        ? undefined
        : ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              valueExpr,
              ts.SyntaxKind.EqualsEqualsToken,
              ts.factory.createToken(ts.SyntaxKind.NullKeyword)
            ),
            ts.factory.createBlock(
              [
                ts.factory.createThrowStatement(
                  ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                    ts.factory.createStringLiteral(`${field.name} should not be null`),
                  ])
                ),
              ],
              true
            )
          ),
      ts.factory.createReturnStatement(valueExpr),
    ].filter(onlyNonNull());
  };

  if (!(field instanceof ObjectField && field.isList())) {
    return createResolverStmts(sourceExpr, field, { nullable: field.isNullable() });
  }

  return [
    ts.factory.createReturnStatement(
      ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(sourceExpr, "map"), undefined, [
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              "item",
              undefined,
              undefined,
              undefined
            ),
          ],
          undefined,
          ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          ts.factory.createBlock(
            createResolverStmts(ts.factory.createIdentifier("item"), field, { nullable: false }),
            true
          )
        ),
      ])
    ),
  ];
}
