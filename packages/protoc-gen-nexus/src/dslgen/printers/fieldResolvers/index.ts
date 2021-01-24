import ts from "typescript";
import { createEnumFieldResolverStmts } from "./enumFieldResolver";
import { createObjectFieldResolverStmts } from "./objectFieldResolver";
import { craeteOneofUnionFieldResolverStmts } from "./oneoUnionfFieldResolver";
import { createScalarFieldResolverStmts } from "./scalarFieldResolver";
import { onlyNonNull } from "../util";
import { EnumType, ObjectField, ObjectOneofField, ScalarType, SquashedOneofUnionType } from "../../types";

export function createFieldResolverDecl(field: ObjectField<any> | ObjectOneofField): ts.MethodDeclaration {
  return createMethodDeclWithValueExpr(field, (valueExpr) => {
    if (field instanceof ObjectOneofField) {
      return craeteOneofUnionFieldResolverStmts(valueExpr, field);
    }
    if (field.type instanceof ScalarType) {
      return createScalarFieldResolverStmts(valueExpr, field);
    }
    if (field.type instanceof EnumType) {
      return createEnumFieldResolverStmts(valueExpr, field);
    }
    if (field.type instanceof SquashedOneofUnionType) {
      return craeteOneofUnionFieldResolverStmts(valueExpr, field);
    }
    return createObjectFieldResolverStmts(valueExpr);
  });
}

function createMethodDeclWithValueExpr(
  field: ObjectField<any> | ObjectOneofField,
  stmtsFn: (valueExpr: ts.Expression) => ts.Statement[]
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "resolve",
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "root", undefined, undefined, undefined)],
    undefined,
    ts.factory.createBlock(
      [
        field instanceof ObjectField
          ? ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    "value",
                    undefined,
                    undefined,
                    field.getProtoFieldAccessExpr(ts.factory.createIdentifier("root"))
                  ),
                ],
                ts.NodeFlags.Const
              )
            )
          : null,
        field.shouldNullCheck()
          ? ts.factory.createIfStatement(
              ts.factory.createBinaryExpression(
                ts.factory.createIdentifier("value"),
                ts.SyntaxKind.EqualsEqualsToken,
                ts.factory.createToken(ts.SyntaxKind.NullKeyword)
              ),
              ts.factory.createBlock(
                [
                  field.isNullable()
                    ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
                    : ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(ts.factory.createIdentifier("Error"), undefined, [
                          ts.factory.createStringLiteral("Cannot return null for non-nullable field"),
                        ])
                      ),
                ],
                true // multiline
              )
            )
          : null,
        ...stmtsFn(ts.factory.createIdentifier(field instanceof ObjectField ? "value" : "root")),
      ].filter(onlyNonNull()),
      true // multiline
    )
  );
}
