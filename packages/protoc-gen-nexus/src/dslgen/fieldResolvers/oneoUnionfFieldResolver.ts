import ts from "typescript";
import { pascalCase, constantCase, camelCase } from "change-case";
import { ProtoOneof } from "../../protogen";
import { createProtoExpr, isIgnoredField, isInputOnlyField, isRequiredField } from "../util";
import { GenerationParams } from "../types";

export function craeteOneofUnionFieldResolverStmts(
  parentExpr: ts.Expression,
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.Statement[] {
  const nullable = !isRequiredField(oneof);
  if (opts.useProtobufjs) {
    return [
      ...oneof.fields
        .filter((f) => !isIgnoredField(f))
        .filter((f) => !isInputOnlyField(f))
        .map((f) =>
          ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(parentExpr, camelCase(f.name)),
            ts.factory.createBlock([
              ts.factory.createReturnStatement(
                ts.factory.createCallExpression(
                  ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Object"), "assign"),
                  undefined,
                  [
                    ts.factory.createPropertyAccessExpression(parentExpr, camelCase(f.name)),
                    ts.factory.createObjectLiteralExpression([
                      ts.factory.createPropertyAssignment(
                        "__protobufTypeName",
                        ts.factory.createAsExpression(
                          // TODO: throw error if the type is not ProtoMesssage
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          ts.factory.createStringLiteral(f.type!.fullName.toString()),
                          ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("const"))
                        )
                      ),
                    ]),
                  ]
                )
              ),
            ])
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
        ts.factory.createPropertyAccessExpression(parentExpr, `get${pascalCase(oneof.name)}Case`),
        undefined,
        undefined
      ),
      ts.factory.createCaseBlock([
        ts.factory.createCaseClause(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createPropertyAccessExpression(
              createProtoExpr(oneof.parent, opts),
              `${pascalCase(oneof.name)}Case`
            ),
            `${constantCase(oneof.name)}_NOT_SET`
          ),
          [
            ts.factory.createBlock(
              [
                nullable
                  ? ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.NullKeyword))
                  : ts.factory.createThrowStatement(ts.factory.createStringLiteral("unreachable")),
              ],
              true // multiline
            ),
          ]
        ),
        ...oneof.fields
          .filter((f) => !isIgnoredField(f))
          .filter((f) => !isInputOnlyField(f))
          .map((f) =>
            ts.factory.createCaseClause(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(
                  createProtoExpr(oneof.parent, opts),
                  `${pascalCase(oneof.name)}Case`
                ),
                constantCase(f.name, {
                  splitRegexp: /([a-z])([A-Z0-9])/g,
                })
              ),
              [
                ts.factory.createBlock(
                  [
                    ts.factory.createReturnStatement(
                      ts.factory.createNonNullExpression(
                        ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(parentExpr, f.googleProtobufGetterName),
                          undefined,
                          undefined
                        )
                      )
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
