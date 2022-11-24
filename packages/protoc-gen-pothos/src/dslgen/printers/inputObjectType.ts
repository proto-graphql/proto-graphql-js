import { InputObjectType } from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createFieldDefinitionExpr, createNoopFieldDefinitionExpr } from "./field";
import {
  createBuilderPropExpr,
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createQualifiedName,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export const HelloInput = builder.inputRef<Omit<_$hello$hello_pb.Hello, "$type">>("HelloInput");
 * HelloInput.implement({
 *   description: "...",
 *   fields: (t) => ({
 *     // ...
 *   }),
 * })
 * ```
 */
export function createInputObjectTypeDslStmts(type: InputObjectType): ts.Statement[] {
  return [
    createInputObjectTypeShapeDecl(type),
    createDslExportConstStmt(
      type.pothosRefObjectName,
      ts.factory.createCallExpression(
        createBuilderPropExpr("inputRef"),
        [ts.factory.createTypeReferenceNode(createInputObjectTypeShapeIdent(type))],
        [ts.factory.createStringLiteral(type.typeName)]
      )
    ),
    ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(type.pothosRefObjectName), "implement"),
        undefined,
        [
          ts.factory.createObjectLiteralExpression(
            [
              createDescriptionPropertyAssignment(type),
              ts.factory.createPropertyAssignment("fields", createInputObjectTypeFieldsMethodExpr(type)),
              ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
            ].filter(onlyNonNull()),
            true
          ),
        ]
      )
    ),
  ];
}

/**
 * @example
 * ```ts
 * definition(t) {
 *   // ...
 * }
 * ```
 */
function createInputObjectTypeFieldsMethodExpr(type: InputObjectType): ts.Expression {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, "t", undefined, undefined, undefined)],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createParenthesizedExpression(
      ts.factory.createObjectLiteralExpression(
        type.fields.length > 0
          ? type.fields.map((f) => ts.factory.createPropertyAssignment(f.name, createFieldDefinitionExpr(f)))
          : [ts.factory.createPropertyAssignment("_", createNoopFieldDefinitionExpr({ input: true }))],
        true
      )
    )
  );
}

/**
 * @example
 * ```ts
 * {
 *   message?: _$hello$hello_pb$Hello["message"] | null,
 *   // ...
 * }
 * ```
 */
function createInputObjectTypeShapeDecl(type: InputObjectType): ts.DeclarationStatement {
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    createInputObjectTypeShapeIdent(type),
    undefined,
    ts.factory.createTypeLiteralNode(
      type.fields.map((field) => {
        let typeNode: ts.TypeNode = ts.factory.createIndexedAccessTypeNode(
          ts.factory.createTypeReferenceNode(createQualifiedName(type.protoTypeFullName)),
          ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(field.protoJsName))
        );
        if (field.type instanceof InputObjectType) {
          typeNode = ts.factory.createTypeReferenceNode(createInputObjectTypeShapeIdent(field.type));
          if (field.isList()) {
            typeNode = ts.factory.createTypeReferenceNode("Array", [typeNode]);
          }
        }
        if (field.isNullable()) {
          typeNode = ts.factory.createUnionTypeNode([
            typeNode,
            ts.factory.createLiteralTypeNode(ts.factory.createToken(ts.SyntaxKind.NullKeyword)),
          ]);
        }
        return ts.factory.createPropertySignature(
          undefined,
          field.name,
          field.isNullable() ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
          typeNode
        );
      })
    )
  );
}

function createInputObjectTypeShapeIdent(type: InputObjectType): ts.Identifier {
  return ts.factory.createIdentifier(`${type.typeName}$Shape`);
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
