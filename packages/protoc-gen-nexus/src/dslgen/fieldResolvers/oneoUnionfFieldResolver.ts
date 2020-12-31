import ts from "typescript";
import { pascalCase, constantCase } from "change-case";
import { ProtoOneof } from "../../protoTypes";
import { createProtoExpr, isRequiredField } from "../util";
import { GenerationParams } from "../types";

export function craeteOneofUnionFieldResolverStmts(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.Statement[] {
  const nullable = !isRequiredField(oneof);
  if (opts.useProtobufjs) {
    return [
      ...oneof.fields.map((f) =>
        ts.factory.createIfStatement(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("root"),
            f.name
          ),
          ts.factory.createBlock([
            ts.factory.createReturnStatement(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("Object"),
                  "assign"
                ),
                undefined,
                [
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("root"),
                    f.name
                  ),
                  ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                      "__protobufTypeName",
                      ts.factory.createAsExpression(
                        // TODO: throw error if the type is not ProtoMesssage
                        ts.factory.createStringLiteral(f.type!.qualifiedName),
                        ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier("const")
                        )
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
        ? ts.factory.createReturnStatement(
            ts.factory.createToken(ts.SyntaxKind.NullKeyword)
          )
        : ts.factory.createThrowStatement(
            ts.factory.createStringLiteral("unreachable")
          ),
    ];
  }
  return [
    ts.factory.createSwitchStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier("root"),
          `get${pascalCase(oneof.name)}Case`
        ),
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
                  ? ts.factory.createReturnStatement(
                      ts.factory.createToken(ts.SyntaxKind.NullKeyword)
                    )
                  : ts.factory.createThrowStatement(
                      ts.factory.createStringLiteral("unreachable")
                    ),
              ],
              true // multiline
            ),
          ]
        ),
        ...oneof.fields.map((f) =>
          ts.factory.createCaseClause(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                createProtoExpr(oneof.parent, opts),
                `${pascalCase(oneof.name)}Case`
              ),
              constantCase(f.name)
            ),
            [
              ts.factory.createBlock(
                [
                  ts.factory.createReturnStatement(
                    ts.factory.createNonNullExpression(
                      ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier("root"),
                          f.getterName
                        ),
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
