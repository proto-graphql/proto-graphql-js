import ts from "typescript";
import { ObjectField, ScalarType } from "../../types";
import { createMapExpr } from "./utils";

export function createScalarFieldResolverStmts(
  valueExpr: ts.Expression,
  field: ObjectField<ScalarType>
): ts.Statement[] {
  if (field.isList() && (field.type.shouldToString() || field.type.unwrapFunc)) {
    return [
      ts.factory.createReturnStatement(
        createMapExpr(valueExpr, (itemExpr) => [
          ts.factory.createReturnStatement(createValueConversionExpr(itemExpr, field)),
        ])
      ),
    ];
  }

  return [ts.factory.createReturnStatement(createValueConversionExpr(valueExpr, field))];
}

function createValueConversionExpr(valueExpr: ts.Expression, field: ObjectField<ScalarType>): ts.Expression {
  let resolverRet = valueExpr;
  if (field.type.unwrapFunc !== null) {
    resolverRet = ts.factory.createCallExpression(ts.factory.createIdentifier(field.type.unwrapFunc.name), undefined, [
      resolverRet,
    ]);
  }
  if (field.type.shouldToString()) {
    if (field.type.isPrimitive()) {
      resolverRet = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(resolverRet, "toString"),
        undefined,
        undefined
      );
    } else {
      resolverRet = ts.factory.createBinaryExpression(
        ts.factory.createCallExpression(
          ts.factory.createPropertyAccessChain(
            resolverRet,
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier("toString")
          ),
          undefined,
          undefined
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
      );
    }
  }

  return resolverRet;
}
