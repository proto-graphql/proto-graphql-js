import ts from "typescript";
import { pascalCase, constantCase } from "change-case";
import {
  ProtoField,
  ProtoMessage,
  ProtoOneof,
  ProtoRegistry,
} from "../protoTypes";
import {
  createDslExportConstStmt,
  createProtoExpr,
  gqlTypeName,
  protoExportAlias,
} from "./util";
import { detectGqlType, GqlType } from "./types";
import { getUnwrapFunc } from "./unwrap";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeDslStmts(
  msgs: ReadonlyArray<ProtoMessage>,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement[] {
  return msgs.map((m) => createObjectTypeDslStmt(m, reg, opts));
}

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
function createObjectTypeDslStmt(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.Statement {
  const typeName = gqlTypeName(msg);
  return createDslExportConstStmt(
    typeName,
    ts.factory.createCallExpression(
      ts.factory.createIdentifier("objectType"),
      undefined,
      [
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "name",
              ts.factory.createStringLiteral(typeName)
            ),
            ts.factory.createPropertyAssignment(
              "description",
              ts.factory.createStringLiteral(msg.description)
            ),
            createObjectTypeDefinitionMethodDecl(msg, reg, opts),
            ts.factory.createPropertyAssignment(
              "sourceType",
              sourceTypeExpr(msg, opts)
            ),
          ],
          true
        ),
      ]
    )
  );
}

/**
 * @example
 * ```ts
 * definition(t) {
 *   // ...
 * }
 * ```
 */
function createObjectTypeDefinitionMethodDecl(
  msg: ProtoMessage,
  reg: ProtoRegistry,
  opts: { importPrefix?: string }
): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "definition",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "t",
        undefined,
        undefined,
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ...msg.fields
          .filter((f) => !f.isOneofMember())
          .map((f) => createFieldDefinitionStmt(f, reg)),
        ...msg.oneofs.map((o) => createOneofFieldDefinitionStmt(o, opts)),
      ],
      true
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   module: __filename,
 *   export: "_$hello$hello_pb$User"
 * }
 * ```
 */
function sourceTypeExpr(
  msg: ProtoMessage,
  opts: { importPrefix?: string }
): ts.Expression {
  return ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment(
      "module",
      ts.factory.createIdentifier("__filename")
    ),
    ts.factory.createPropertyAssignment(
      "export",
      ts.factory.createStringLiteral(protoExportAlias(msg, opts))
    ),
  ]);
}

/**
 * @example
 * ```ts
 * t.nonNull.string("name", {
 *   // ...
 * })
 * ```
 */
function createFieldDefinitionStmt(
  field: ProtoField,
  registry: ProtoRegistry
): ts.Statement {
  const type = detectGqlType(field, registry);
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("t"),
        ts.factory.createIdentifier("field")
      ),
      undefined,
      [
        ts.factory.createStringLiteral(field.name),
        createFieldOptionExpr(field, type),
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
function createFieldOptionExpr(
  field: ProtoField,
  type: GqlType
): ts.Expression {
  const createTypeSpecifier = (type: GqlType): ts.Expression => {
    switch (type.kind) {
      case "list":
        return ts.factory.createCallExpression(
          ts.factory.createIdentifier("list"),
          undefined,
          [createTypeSpecifier(type.type)]
        );
      case "object":
      case "scalar":
      case "enum":
        return ts.factory.createCallExpression(
          ts.factory.createIdentifier(type.nullable ? "nullable" : "nonNull"),
          undefined,
          [ts.factory.createStringLiteral(type.type)]
        );
      default:
        const _exhaustiveCheck: never = type; // eslint-disable-line
        throw "unreachable";
    }
  };

  let resolverRet: ts.Expression = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("root"),
      ts.factory.createIdentifier(field.getterName)
    ),
    undefined,
    undefined
  );
  if (type.kind === "object") {
    if (type.nullable) {
      resolverRet = ts.factory.createBinaryExpression(
        resolverRet,
        ts.SyntaxKind.QuestionQuestionToken,
        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
      );
    } else {
      resolverRet = ts.factory.createNonNullExpression(resolverRet);
    }
  }

  const unwrapFunc = getUnwrapFunc(field);
  if (unwrapFunc !== null) {
    resolverRet = ts.factory.createCallExpression(
      ts.factory.createIdentifier(unwrapFunc.name),
      undefined,
      [resolverRet]
    );
  }
  if (type.kind === "scalar") {
    switch (field.descriptor.getType()!) {
      case FieldDescriptorProto.Type.TYPE_INT64:
      case FieldDescriptorProto.Type.TYPE_UINT64:
      case FieldDescriptorProto.Type.TYPE_FIXED64:
      case FieldDescriptorProto.Type.TYPE_SFIXED64:
      case FieldDescriptorProto.Type.TYPE_SINT64: {
        resolverRet = ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(resolverRet, "toString"),
          undefined,
          undefined
        );
        break;
      }
      case FieldDescriptorProto.Type.TYPE_MESSAGE: {
        switch (field.descriptor.getTypeName()) {
          case ".google.protobuf.Int64Value":
          case ".google.protobuf.UInt64Value":
            resolverRet = ts.factory.createBinaryExpression(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessChain(
                  resolverRet,
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier("toString")
                ),
                undefined,
                undefined
              ),
              ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
              ts.factory.createToken(ts.SyntaxKind.NullKeyword)
            );
            break;
        }
        break;
      }
    }
  }

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", createTypeSpecifier(type)),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(field.description)
      ),
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
        ts.factory.createBlock([ts.factory.createReturnStatement(resolverRet)])
      ),
    ],
    true
  );
}

/**
 * @example
 * ```ts
 * t.nonNull.string("name", {
 *   // ...
 * })
 * ```
 */
function createOneofFieldDefinitionStmt(
  oneof: ProtoOneof,
  opts: { importPrefix?: string }
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
  opts: { importPrefix?: string }
): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "type",
        ts.factory.createCallExpression(
          ts.factory.createIdentifier(
            oneof.isNullable() ? "nullable" : "nonNull"
          ),
          undefined,
          [ts.factory.createStringLiteral(gqlTypeName(oneof))]
        )
      ),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(oneof.description)
      ),
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
        ts.factory.createBlock(
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
                        oneof.isNullable()
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
        )
      ),
    ],
    true
  );
}
