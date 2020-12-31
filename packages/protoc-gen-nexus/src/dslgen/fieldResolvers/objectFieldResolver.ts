import ts from "typescript";
import { GqlType } from "../types";

export function createObjectFieldResolverStmts(
  valueExpr: ts.Expression,
  type: GqlType
): ts.Statement[] {
  let resolverRet = valueExpr;
  if (type.nullable) {
    resolverRet = ts.factory.createBinaryExpression(
      resolverRet,
      ts.SyntaxKind.QuestionQuestionToken,
      ts.factory.createToken(ts.SyntaxKind.NullKeyword)
    );
  }
  return [ts.factory.createReturnStatement(resolverRet)];
}
