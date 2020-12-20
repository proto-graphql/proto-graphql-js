import ts from "typescript";
import { ProtoField, ProtoRegistry } from "../protoTypes";
import { detectGqlType, GqlType } from "./types";
import { getUnwrapFunc } from "./unwrap";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { onlyNonNull } from "./util";

/**
 * @example
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createFieldDefinitionStmt(
  field: ProtoField,
  registry: ProtoRegistry,
  opts?: { input?: boolean }
): ts.Statement {
  const type = detectGqlType(field, registry, opts);
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier("t"),
        ts.factory.createIdentifier("field")
      ),
      undefined,
      [
        ts.factory.createStringLiteral(field.name),
        createFieldOptionExpr(field, type, opts),
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
  type: GqlType,
  opts?: { input?: boolean }
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

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", createTypeSpecifier(type)),
      ts.factory.createPropertyAssignment(
        "description",
        ts.factory.createStringLiteral(field.description)
      ),
      opts?.input ? null : createFieldResolverDecl(field, type),
    ].filter(onlyNonNull()),
    true
  );
}

function createFieldResolverDecl(
  field: ProtoField,
  type: GqlType
): ts.MethodDeclaration {
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

  return ts.factory.createMethodDeclaration(
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
  );
}
