import { InterfaceType, ObjectType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createFieldDefinitionExpr, createNoopFieldDefinitionExpr } from "./field";
import {
  createBuilderCallExpr,
  createBuilderPropExpr,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createQualifiedName,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export const Hello = builder.objectRef<_$hello$hello_pb.Hello>("Hello")
 * builder.objectType(Hello, {
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeDslStmts(objType: ObjectType): ts.Statement[] {
  const isInterface = objType instanceof InterfaceType;
  return [
    createDslExportConstStmt(
      objType.pothosRefObjectName,
      ts.factory.createCallExpression(
        createBuilderPropExpr(isInterface ? "interfaceRef" : "objectRef"),
        [
          isInterface
            ? ts.factory.createTypeReferenceNode("Pick", [
                ts.factory.createTypeReferenceNode(createQualifiedName(objType.protoTypeFullName)),
                ts.factory.createUnionTypeNode(
                  objType.fields.map((f) =>
                    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(f.protoJsName))
                  )
                ),
              ])
            : ts.factory.createTypeReferenceNode(createQualifiedName(objType.protoTypeFullName)),
        ],
        [ts.factory.createStringLiteral(objType.typeName)]
      )
    ),
    ts.factory.createExpressionStatement(
      createBuilderCallExpr(isInterface ? "interfaceType" : "objectType", [
        ts.factory.createIdentifier(objType.pothosRefObjectName),
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(objType.typeName)),
            createDescriptionPropertyAssignment(objType),
            ts.factory.createPropertyAssignment("fields", createObjectTypeFieldsFuncExpr(objType)),
            isInterface ? null : ts.factory.createPropertyAssignment("isTypeOf", createIsTypeOfMethodExpr(objType)),
          ].filter(onlyNonNull()),
          true
        ),
      ])
    ),
  ];
}

/**
 * @example
 * ```ts
 * fields: (t) => ({
 *   // ...
 * })
 * ```
 */
function createObjectTypeFieldsFuncExpr(objType: ObjectType): ts.Expression {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createParenthesizedExpression(
      ts.factory.createObjectLiteralExpression(
        objType.fields.length > 0
          ? objType.fields.map((f) => ts.factory.createPropertyAssignment(f.name, createFieldDefinitionExpr(f)))
          : [ts.factory.createPropertyAssignment("_", createNoopFieldDefinitionExpr({ input: false }))],
        true
      )
    )
  );
}

/**
 * @example
 * ```ts
 * isTypeOf(data) {
 *   return data instanceof _$hello$hello_pb.Hello;
 *
 * (source) =>
 *   // eslint-disable-next-line @typescript-eslint/ban-types
 *   (source as _$hello$hello_pb.Hello | { $type: string & {} }).$type === "hello.Hello",
 * }
 * ```
 */
function createIsTypeOfMethodExpr(objType: ObjectType): ts.Expression {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "source", undefined, undefined, undefined)],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createParenthesizedExpression(
                ts.factory.createAsExpression(
                  ts.factory.createIdentifier("source"),
                  ts.factory.createUnionTypeNode([
                    ts.factory.createTypeReferenceNode(createQualifiedName(objType.protoTypeFullName)),
                    ts.factory.createTypeLiteralNode([
                      ts.factory.createPropertySignature(
                        undefined,
                        "$type",
                        undefined,
                        ts.factory.createIntersectionTypeNode([
                          ts.factory.createToken(ts.SyntaxKind.StringKeyword),
                          ts.factory.createTypeLiteralNode([]),
                        ])
                      ),
                    ]),
                  ])
                )
              ),
              "$type"
            ),
            ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.factory.createStringLiteral(objType.proto.fullName.toString())
          )
        ),
      ],
      true
    )
  );
}
