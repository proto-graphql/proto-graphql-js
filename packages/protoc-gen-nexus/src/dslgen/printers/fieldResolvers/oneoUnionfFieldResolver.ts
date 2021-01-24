import ts from "typescript";
import { pascalCase, constantCase } from "change-case";
import { createFullNameExpr } from "../util";
import { ObjectField, ObjectOneofField, SquashedOneofUnionType } from "../../types";

export function craeteOneofUnionFieldResolverStmts(
  parentExpr: ts.Expression,
  field: ObjectField<SquashedOneofUnionType> | ObjectOneofField
): ts.Statement[] {
  const nullable = field.isNullable();
  // FIXME: remove
  if (field.isProtobufjs()) {
    return [
      ...field.type.fields.map((f) =>
        ts.factory.createIfStatement(
          ts.factory.createPropertyAccessExpression(parentExpr, f.protoJsName),
          ts.factory.createBlock([ts.factory.createReturnStatement(f.getProtoFieldAccessExpr(parentExpr))])
        )
      ),
      nullable
        ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
        : ts.factory.createThrowStatement(ts.factory.createStringLiteral("unreachable")),
    ];
  }
  return [
    ts.factory.createSwitchStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(parentExpr, `get${pascalCase(field.name)}Case`),
        undefined,
        undefined
      ),
      ts.factory.createCaseBlock([
        ts.factory.createCaseClause(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              createFullNameExpr(field.type.parentProtoTypeFullName),
              `${pascalCase(field.name)}Case`
            ),
            `${constantCase(field.name)}_NOT_SET`
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
        ...field.type.fields.map((f) =>
          ts.factory.createCaseClause(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                createFullNameExpr(field.type.parentProtoTypeFullName),
                `${pascalCase(field.name)}Case`
              ),
              constantCase(f.name, {
                splitRegexp: /([a-z])([A-Z0-9])/g,
              })
            ),
            [
              ts.factory.createBlock(
                [
                  ts.factory.createReturnStatement(
                    ts.factory.createNonNullExpression(f.getProtoFieldAccessExpr(parentExpr))
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
