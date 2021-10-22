import ts from "typescript";
import { OneofUnionType, SquashedOneofUnionType } from "../types";
import {
  createDescriptionPropertyAssignment,
  createDslExportConstStmt,
  createFullNameExpr,
  createNexusCallExpr,
  createProtoNexusType,
  onlyNonNull,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = unionType({
 *   name: "Oneof",
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeDslStmt(type: OneofUnionType | SquashedOneofUnionType): ts.Statement {
  return createDslExportConstStmt(
    type.typeName,
    createNexusCallExpr("unionType", [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.typeName)),
          createDescriptionPropertyAssignment(type),
          createOneofUnionTypeDefinitionMethodDecl(type),
          ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(type)),
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
function createOneofUnionTypeDefinitionMethodDecl(type: OneofUnionType | SquashedOneofUnionType): ts.MethodDeclaration {
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
      [
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("t"),
              ts.factory.createIdentifier("members")
            ),
            undefined,
            type.fields.map((f) => createFullNameExpr(f.typeFullName!))
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
function createExtensionsObjectLiteralExpr(type: OneofUnionType | SquashedOneofUnionType): ts.Expression {
  if (type instanceof SquashedOneofUnionType) {
    const objExpr = ts.factory.createObjectLiteralExpression(
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

    return ts.factory.createObjectLiteralExpression(
      [
        ts.factory.createSpreadAssignment(
          ts.factory.createParenthesizedExpression(
            ts.factory.createAsExpression(
              objExpr,
              ts.factory.createTypeReferenceNode(createProtoNexusType("ProtobufMessageExtensions"))
            )
          )
        ),
      ],
      true
    );
  }

  const objExpr = ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufOneof",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment(
              "fullName",
              ts.factory.createStringLiteral(type.proto.fullName.toString())
            ),
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(type.proto.name)),
            ts.factory.createPropertyAssignment("messageName", ts.factory.createStringLiteral(type.proto.parent.name)),
            ts.factory.createPropertyAssignment(
              "package",
              ts.factory.createStringLiteral(type.proto.parent.file.package)
            ),
          ],
          true
        )
      ),
    ],
    true
  );

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createSpreadAssignment(
        ts.factory.createParenthesizedExpression(
          ts.factory.createAsExpression(
            objExpr,
            ts.factory.createTypeReferenceNode(createProtoNexusType("ProtobufOneofExtensions"))
          )
        )
      ),
    ],
    true
  );
}
