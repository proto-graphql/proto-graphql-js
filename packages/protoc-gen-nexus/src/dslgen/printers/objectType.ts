import ts from "typescript";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createFullNameExpr,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";
import { createFieldDefinitionStmt, createNoopFieldDefinitionStmt } from "./field";
import { ObjectType, InterfaceType } from "../types";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeDslStmt(objType: ObjectType): ts.Statement {
  const isInterface = objType instanceof InterfaceType;
  return createDslExportConstStmt(
    objType.typeName,
    createNexusCallExpr(isInterface ? "interfaceType" : "objectType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(objType.typeName)),
          createDescriptionPropertyAssignment(objType),
          createObjectTypeDefinitionMethodDecl(objType),
          isInterface ? null : createIsTypeOfMethodDecl(objType),
          isInterface ? null : ts.factory.createPropertyAssignment("sourceType", sourceTypeExpr(objType)),
          ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(objType)),
        ].filter(onlyNonNull()),
        true
      ),
    ])
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
function createObjectTypeDefinitionMethodDecl(objType: ObjectType): ts.MethodDeclaration {
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
      objType.fields.length > 0
        ? objType.fields.map((f) => createFieldDefinitionStmt(f))
        : [createNoopFieldDefinitionStmt({ input: false })],
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
function sourceTypeExpr(objType: ObjectType): ts.Expression {
  return ts.factory.createObjectLiteralExpression([
    ts.factory.createPropertyAssignment("module", ts.factory.createIdentifier("__filename")),
    ts.factory.createPropertyAssignment("export", ts.factory.createStringLiteral(objType.sourceTypeExportAlias)),
  ]);
}

/**
 * @example
 * ```ts
 * isTypeOf(data) {
 *   return data instanceof _$hello$hello_pb.Hello;
 * }
 * ```
 */
function createIsTypeOfMethodDecl(objType: ObjectType): ts.MethodDeclaration {
  return ts.factory.createMethodDeclaration(
    undefined,
    undefined,
    undefined,
    "isTypeOf",
    undefined,
    undefined,
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        "data",
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        undefined
      ),
    ],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createIdentifier("data"),
            ts.SyntaxKind.InstanceOfKeyword,
            createFullNameExpr(objType.protoTypeFullName)
          )
        ),
      ],
      true
    )
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
function createExtensionsObjectLiteralExpr(objType: ObjectType): ts.Expression {
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufMessage",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "fullName",
              ts.factory.createStringLiteral(objType.proto.fullName.toString())
            ),
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(objType.proto.name)),
            ts.factory.createPropertyAssignment("package", ts.factory.createStringLiteral(objType.proto.file.package)),
          ],
          true
        )
      ),
    ],
    true
  );
}
