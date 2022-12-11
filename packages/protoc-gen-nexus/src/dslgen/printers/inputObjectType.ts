import {
  compact,
  createSetFieldValueCode,
  EnumType,
  InputObjectField,
  InputObjectType,
  protobufGraphQLExtensions,
  protoType,
  ScalarType,
} from "@proto-graphql/codegen-core";
import { Code, code, joinCode, literalOf } from "ts-poet";
import ts from "typescript";
import {
  createFieldDefinitionCode,
  createFieldDefinitionStmt,
  createFieldOptionExpr,
  createNoopFieldDefinitionCode,
  createNoopFieldDefinitionStmt,
  createTypeCode,
} from "./field";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createFullNameExpr,
  createGqlToProto,
  createNexusCallExpr,
  createProtoNexusCallExpr,
  createQualifiedName,
  fieldType,
  impNexus,
  impProtoNexus,
  isProtobufLong,
  isWellKnownType,
  NexusPrinterOptions,
  nexusTypeDef,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt HelloInput = Object.assign(
 *   inputObjectType({
 *     name: "HelloInput",
 *     // ...
 *   }),
 *   {
 *     toProto: (input: NexusGen['inputTypes']['HelloInput']): _$hello$hello_pb.Hello => {
 *       // ...
 *     }
 *   },
 * )
 * ```
 */
export function createInputObjectTypeCode(type: InputObjectType, opts: NexusPrinterOptions): Code {
  const typeOpts = {
    name: type.typeName,
    description: type.description,
    definition: code`(t) => {
      ${
        type.fields.length > 0
          ? joinCode(type.fields.map((f) => createFieldDefinitionCode(f, opts)))
          : createNoopFieldDefinitionCode({ input: true })
      }
    }`,
    extensions: protobufGraphQLExtensions(type),
  };
  return code`
    export const ${nexusTypeDef(type)} = Object.assign(
      ${impNexus("inputObjectType")}(${literalOf(compact(typeOpts))}),
      {
        toProto: ${createToProtoFuncCode(type, opts)},
        _protoNexus: {
          fields: {
            ${joinCode(
              type.fields.map(
                (f) =>
                  code`${f.name}: ${literalOf({
                    type: createTypeCode(f, opts),
                    extensions: protobufGraphQLExtensions(f),
                  })},`
              )
            )}
          },
        },
      }
    );
  `;
}

export function createToProtoFuncCode(type: InputObjectType, opts: NexusPrinterOptions): Code {
  return code`
    (input: NexusGen["inputTypes"][${literalOf(type.typeName)}]): ${protoType(type.proto, opts)} => {
      const output = new ${protoType(type.proto, opts)}();
      ${joinCode(
        type.fields.map((f) => {
          let wrapperFunc: (v: Code) => Code = (v) => v;
          if (f.type instanceof ScalarType) {
            if (isWellKnownType(f.proto.type)) {
              const protoFullName = f.proto.type.fullName.toString();
              const transformer = code`${impProtoNexus("getTransformer")}("${protoFullName}")`;
              switch (opts.protobuf) {
                case "google-protobuf":
                  wrapperFunc = (v) => code`${transformer}.gqlToProto(${v})`;
                  break;
                case "protobufjs": {
                  const wktype = protoType(f.proto, opts);
                  const needsAsAny =
                    opts.protobuf === "protobufjs" &&
                    (protoFullName === "google.protobuf.Int64Value" ||
                      protoFullName === "google.protobuf.UInt64Value" ||
                      protoFullName === "google.protobuf.Timestamp");
                  wrapperFunc = (v) => {
                    let value = code`${transformer}.gqlToProto(${v})`;
                    if (needsAsAny) value = code`${value} as any`;
                    return code`new ${wktype}(${value})`;
                  };
                  break;
                }
              }
            } else if (isProtobufLong(f.proto)) {
              wrapperFunc = (v) => code`${impProtoNexus("stringToNumber")}(${v})`;
            }
          }
          if (f.type instanceof InputObjectType) {
            const ft = fieldType(f as InputObjectField<InputObjectType>, opts);
            wrapperFunc = (v) => code`${ft}.toProto(${v})`;
          }
          const value = code`input.${f.name}`;
          const stmt = createSetFieldValueCode(
            code`output`,
            f.isList() ? code`${value}.map(v => ${wrapperFunc(code`v`)})` : wrapperFunc(value),
            f.proto,
            opts
          );
          if (f.isNullable()) {
            return code`if (input.${f.name} != null) {
              ${stmt};
            }`;
          }
          return code`${stmt};`;
        })
      )}
      return output;
    }
  `;
}

/**
 * @example
 * ```ts
 * export cosnt HelloInput = Object.assign(
 *   inputObjectType({
 *     name: "HelloInput",
 *     // ...
 *   }),
 *   {
 *     toProto: (input: NexusGen['inputTypes']['HelloInput']): _$hello$hello_pb.Hello => {
 *       // ...
 *     }
 *   },
 * )
 * ```
 */
export function createInputObjectTypeDslStmt(type: InputObjectType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Object"), "assign"),
      undefined,
      [
        createNexusCallExpr("inputObjectType", [
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
              createDescriptionPropertyAssignment(type),
              createInputObjectTypeDefinitionMethodDecl(type),
              ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
            ].filter(onlyNonNull()),
            true
          ),
        ]),
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment("toProto", createToProtoFunc(type)),
            ts.factory.createPropertyAssignment(
              "_protoNexus",
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    "fields",
                    ts.factory.createObjectLiteralExpression(
                      type.fields.map((f) => ts.factory.createPropertyAssignment(f.name, createFieldOptionExpr(f))),
                      true
                    )
                  ),
                ],
                true
              )
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
function createInputObjectTypeDefinitionMethodDecl(type: InputObjectType): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "definition",
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createBlock(
      type.fields.length > 0
        ? type.fields.map((f) => createFieldDefinitionStmt(f))
        : [createNoopFieldDefinitionStmt({ input: true })],
      true
    )
  );
}

/**
 * @example
 * ```ts
 * NexusGen['inputTypes']['HelloInput']
 * ```
 */
function createGenTypeNode(type: InputObjectType): ts.TypeNode {
  return ts.factory.createIndexedAccessTypeNode(
    ts.factory.createIndexedAccessTypeNode(
      ts.factory.createTypeReferenceNode("NexusGen"),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("inputTypes"))
    ),
    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(type.typeName))
  );
}

/**
 * @example
 * ```ts
 * _$hello$hello_pb.Hello
 * ```
 */
function createFromProtoReturnType(type: InputObjectType): ts.TypeNode {
  return ts.factory.createTypeReferenceNode(createQualifiedName(type.protoTypeFullName));
}

/**
 * @example
 * ```ts
 * (input: NexusGen['inputTypes']['HelloInput']): _$hello$hello_pb.Hello => {
 *   // ...
 * }
 * ```
 */
function createToProtoFunc(type: InputObjectType) {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "input",
        undefined,
        createGenTypeNode(type),
        undefined
      ),
    ],
    createFromProtoReturnType(type),
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(createToProtoFuncBodyStmts(type), true)
  );
}

function createToProtoFuncBodyStmts(type: InputObjectType): ts.Statement[] {
  const stmts: ts.Statement[] = [
    ts.factory.createVariableStatement(
      [],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            "output",
            undefined,
            undefined,
            ts.factory.createNewExpression(createFullNameExpr(type.protoTypeFullName), undefined, [])
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
  ];
  const inputExpr = ts.factory.createIdentifier("input");
  const outputExpr = ts.factory.createIdentifier("output");

  for (const field of type.fields) {
    let inputValueExpr: ts.Expression = ts.factory.createPropertyAccessExpression(inputExpr, field.name);
    let buildFunc = (input: ts.Expression): ts.Expression => input;

    if (field.type instanceof ScalarType) {
      buildFunc = (inputValueExpr: ts.Expression) =>
        createScalarToProtoExpr(inputValueExpr, field as InputObjectField<ScalarType>);
    } else if (field.type instanceof EnumType) {
      // no-op
    } else if (field.type instanceof InputObjectType) {
      buildFunc = (inputValueExpr: ts.Expression) =>
        createInputObjectToProtoExpr(inputValueExpr, field as InputObjectField<InputObjectType>);
    } else {
      const _exhaustiveCheck: never = field.type;
      throw "unreachable";
    }
    if (field.isList()) {
      inputValueExpr = ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(inputValueExpr, "map"),
        undefined,
        [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                "v",
                undefined,
                undefined,
                undefined
              ),
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            buildFunc(ts.factory.createIdentifier("v"))
          ),
        ]
      );
    } else {
      inputValueExpr = buildFunc(inputValueExpr);
    }
    let stmt: ts.Statement;
    switch (field.protoSetterType) {
      case "method": {
        stmt = ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(outputExpr, field.protoSetterNameForGoogleProtobuf),
            undefined,
            [inputValueExpr]
          )
        );
        break;
      }
      case "property": {
        stmt = ts.factory.createExpressionStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(outputExpr, field.protoJsName),
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            inputValueExpr
          )
        );
        break;
      }
      default: {
        const _exhaustiveCheck: never = field.protoSetterType;
        throw "unreachable";
      }
    }
    if (field.isNullable()) {
      stmt = ts.factory.createIfStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(inputExpr, field.name),
          ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
          ts.factory.createToken(ts.SyntaxKind.NullKeyword)
        ),
        ts.factory.createBlock([stmt], true)
      );
    }
    stmts.push(stmt);
  }

  stmts.push(ts.factory.createReturnStatement(outputExpr));

  return stmts;
}

function createScalarToProtoExpr(inputExpr: ts.Expression, field: InputObjectField<ScalarType>): ts.Expression {
  let outputExpr = inputExpr;
  if (field.type.shouldToString()) {
    outputExpr = createProtoNexusCallExpr("stringToNumber", [outputExpr]);
  }
  if (!field.type.isPrimitive()) {
    outputExpr = ts.factory.createCallExpression(createGqlToProto(field.type), undefined, [outputExpr]);

    // NOTE: only protobufjs
    const fullName = field.typeFullName;
    if (fullName) {
      // FIXME: avoid `as any`
      if (field.type.hasProtobufjsLong()) {
        outputExpr = ts.factory.createAsExpression(
          outputExpr,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
        );
      }
      outputExpr = ts.factory.createNewExpression(createFullNameExpr(fullName), undefined, [outputExpr]);
    }
  }

  return outputExpr;
}

function createInputObjectToProtoExpr(
  inputExpr: ts.Expression,
  field: InputObjectField<InputObjectType>
): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(createFullNameExpr(field.typeFullName), "toProto"),
    undefined,
    [inputExpr]
  );
}

/**
 * @example
 * ```ts
 * {
 *   protobufMessage: {
 *     fullName: "...",
 *     name: "...",
 *     package: "...",
 *   },
 * }
 * ```
 */
function createExtensionsObjectLiteralExpr(type: InputObjectType): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufMessage",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "fullName",
              ts.factory.createStringLiteral(type.proto.fullName.toString())
            ),
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.proto.name)),
            ts.factory.createPropertyAssignment("package", ts.factory.createStringLiteral(type.proto.file.package)),
          ],
          true
        )
      ),
    ],
    true
  );
}
