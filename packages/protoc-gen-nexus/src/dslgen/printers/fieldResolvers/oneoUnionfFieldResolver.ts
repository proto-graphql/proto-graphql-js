import ts from "typescript";
import { pascalCase, constantCase } from "change-case";
import { createFullNameExpr } from "../util";
import { ObjectField, ObjectOneofField, OneofUnionType, SquashedOneofUnionType } from "../../types";
import { createMapExpr } from "./utils";

export function craeteOneofUnionFieldResolverStmts(
  parentExpr: ts.Expression,
  field: ObjectField<SquashedOneofUnionType> | ObjectOneofField
): ts.Statement[] {
  const createStmts = (itemExpr: ts.Expression) => {
    const nullable = field.isNullable();
    if (field.isProtobufjs()) {
      return createOneofUnionFieldResolverMapStmtsForProtobufjs(itemExpr, field.type, { nullable });
    }
    const oneofName = field.type.oneofName;
    return createOneofUnionFieldResolverMapStmtsForGoogleProtobuf(itemExpr, field.type, { oneofName, nullable });
  };

  if (field.isList()) {
    return [ts.factory.createReturnStatement(createMapExpr(parentExpr, createStmts))];
  }
  return createStmts(parentExpr);
}

function createOneofUnionFieldResolverMapStmtsForProtobufjs(
  valueExpr: ts.Expression,
  type: SquashedOneofUnionType | OneofUnionType,
  { nullable }: { nullable: boolean }
): ts.Statement[] {
  return [
    ...type.fields.map((f) =>
      ts.factory.createIfStatement(
        ts.factory.createPropertyAccessExpression(valueExpr, f.protoJsName),
        ts.factory.createBlock([ts.factory.createReturnStatement(f.getProtoFieldAccessExpr(valueExpr))])
      )
    ),
    nullable
      ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
      : ts.factory.createThrowStatement(ts.factory.createStringLiteral("unreachable")),
  ];
}

function createOneofUnionFieldResolverMapStmtsForGoogleProtobuf(
  valueExpr: ts.Expression,
  type: SquashedOneofUnionType | OneofUnionType,
  { oneofName, nullable }: { oneofName: string; nullable: boolean }
): ts.Statement[] {
  return [
    ts.factory.createSwitchStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(valueExpr, `get${pascalCase(oneofName)}Case`),
        undefined,
        undefined
      ),
      ts.factory.createCaseBlock([
        ts.factory.createCaseClause(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              createFullNameExpr(type.parentProtoTypeFullName),
              `${pascalCase(oneofName)}Case`
            ),
            `${constantCase(oneofName)}_NOT_SET`
          ),
          [
            ts.factory.createBlock(
              [
                nullable
                  ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
                  : ts.factory.createThrowStatement(ts.factory.createStringLiteral("unreachable")),
              ],
              true // multline
            ),
          ]
        ),
        ...type.fields.map((f) =>
          ts.factory.createCaseClause(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                createFullNameExpr(type.parentProtoTypeFullName),
                `${pascalCase(oneofName)}Case`
              ),
              constantCase(f.name, {
                splitRegexp: /([a-z])([A-Z0-9])/g,
              })
            ),
            [
              ts.factory.createBlock(
                [
                  ts.factory.createReturnStatement(
                    ts.factory.createNonNullExpression(f.getProtoFieldAccessExpr(valueExpr))
                  ),
                ],
                true // multiline
              ),
            ]
          )
        ),
        ts.factory.createDefaultClause([
          ts.factory.createBlock(
            [
              ts.factory.createThrowStatement(
                // TODO: throw custom error
                ts.factory.createStringLiteral("unreachable")
              ),
            ],
            true // multiline
          ),
        ]),
      ])
    ),
  ];
}
