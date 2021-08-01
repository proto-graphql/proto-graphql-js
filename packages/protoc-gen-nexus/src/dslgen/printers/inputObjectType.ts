import ts from "typescript";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createFullNameExpr,
  createGqlToProto,
  createNexusCallExpr,
  createQualifiedName,
  onlyNonNull,
} from "./util";
import { createFieldDefinitionStmt, createNoopFieldDefinitionStmt, createFieldOptionExpr } from "./field";
import { EnumType, InputObjectField, InputObjectType, ScalarType } from "../types";

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
    // FIXME: avoid parseInt
    outputExpr = ts.factory.createCallExpression(ts.factory.createIdentifier("parseInt"), undefined, [outputExpr]);
  }
  if (!field.type.isPrimitive()) {
    outputExpr = ts.factory.createCallExpression(createGqlToProto(field.type), undefined, [outputExpr]);

    if (!field.isProtobufjs()) {
      outputExpr = ts.factory.createNonNullExpression(outputExpr);
    } else {
      const fullName = field.typeFullName;
      if (fullName) {
        // FIXME: avoid `as any`
        outputExpr = ts.factory.createNewExpression(createFullNameExpr(fullName), undefined, [
          ts.factory.createAsExpression(outputExpr, ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
        ]);
      }
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
