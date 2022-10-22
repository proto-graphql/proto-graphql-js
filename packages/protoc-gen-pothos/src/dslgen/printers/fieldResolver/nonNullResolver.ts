import ts from "typescript";

export function createNonNullResolverStmts(valueExpr: ts.Expression): ts.Statement[] {
  return [ts.factory.createReturnStatement(ts.factory.createNonNullExpression(valueExpr))];
}
