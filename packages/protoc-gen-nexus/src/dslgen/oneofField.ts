import ts from "typescript";
import { pascalCase, constantCase } from "change-case";
import { ProtoOneof } from "../protoTypes";
import {
  createDeprecationPropertyAssignment,
  createProtoExpr,
  gqlTypeName,
  isRequiredField,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createOneofFieldDefinitionStmt(
  oneof: ProtoOneof,
  opts: { importPrefix?: string; useProtobufjs?: boolean }
): ts.Statement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("t"),
        ts.factory.createIdentifier("field")
      ),
      undefined,
      [
        ts.factory.createStringLiteral(oneof.name),
        createOneofFieldOptionExpr(oneof, opts),
      ]
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   description: '...',
 *   type: '...',
 *   resolve(root) {
 *     // ...
 *   }
 * }
 * ```
 */
function createOneofFieldOptionExpr(
  oneof: ProtoOneof,
  opts: { importPrefix?: string; useProtobufjs?: boolean }
): ts.Expression {
  const nullable = !isRequiredField(oneof);
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(nullable ? "nullable" : "nonNull"),
          undefined,
          [ts.factory.createStringLiteral(gqlTypeName(oneof))]
        )
      ),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(oneof.description)
      ),
      createDeprecationPropertyAssignment(oneof),
      ts.factory.createMethodDeclaration(
        undefined,
        undefined,
        undefined,
        "resolve",
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "root",
            undefined,
            undefined,
            undefined
          ),
        ],
        undefined,
        craeteOneofUnionTypeResolveMethodBlock(oneof, opts)
      ),
    ].filter(onlyNonNull()),
    true
  );
}

function craeteOneofUnionTypeResolveMethodBlock(
  oneof: ProtoOneof,
  opts: { importPrefix?: string; useProtobufjs?: boolean }
) {
  const nullable = !isRequiredField(oneof);
  if (opts.useProtobufjs) {
    return ts.factory.createBlock(
      [
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
      ],
      true // multiline
    );
  }
  return ts.factory.createBlock(
    [
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
    ],
    true // multiline
  );
}
