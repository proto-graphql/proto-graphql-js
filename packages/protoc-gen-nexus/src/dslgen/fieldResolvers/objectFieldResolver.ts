import ts from "typescript";

export function createObjectFieldResolverStmts(valueExpr: ts.Expression): ts.Statement[] {
  return [ts.factory.createReturnStatement(valueExpr)];
}
