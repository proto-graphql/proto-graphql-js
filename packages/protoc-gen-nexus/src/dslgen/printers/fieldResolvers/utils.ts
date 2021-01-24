import ts from "typescript";

export function createMapExpr(
  listExpr: ts.Expression,
  blockFn: (valueExpr: ts.Expression) => ts.Statement[]
): ts.Expression {
  return ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(listExpr, "map"), undefined, [
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "item", undefined, undefined, undefined)],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.factory.createBlock(
        blockFn(ts.factory.createIdentifier("item")),
        true // multiline
      )
    ),
  ]);
}
