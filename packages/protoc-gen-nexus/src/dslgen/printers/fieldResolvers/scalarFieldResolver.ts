import ts from "typescript";
import { ProtoField } from "../../../protogen";
import { ObjectField, ScalarType } from "../../types";

export function createScalarFieldResolverStmts(
  valueExpr: ts.Expression,
  field: ObjectField<ProtoField, ScalarType>
): ts.Statement[] {
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

  return [ts.factory.createReturnStatement(resolverRet)];
}
