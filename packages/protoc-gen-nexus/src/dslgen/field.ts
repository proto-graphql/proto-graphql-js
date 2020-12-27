import ts from "typescript";
import { ProtoEnum, ProtoField, ProtoRegistry } from "../protoTypes";
import { detectGqlType, GqlType } from "./types";
import { getUnwrapFunc } from "./unwrap";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import {
  createDeprecationPropertyAssignment,
  createProtoExpr,
  getEnumValueForUnspecified,
  gqlTypeName,
  onlyNonNull,
} from "./util";
import { camelCase } from "change-case";

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
  opts?: { input?: boolean; importPrefix?: string; useProtobufjs?: boolean }
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
  opts?: { input?: boolean; importPrefix?: string; useProtobufjs?: boolean }
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
      createDeprecationPropertyAssignment(field),
      opts?.input
        ? null
        : createFieldResolverDecl(field, type, {
            importPrefix: opts?.importPrefix,
            useProtobufjs: opts?.useProtobufjs,
          }),
    ].filter(onlyNonNull()),
    true
  );
}

function createFieldResolverDecl(
  field: ProtoField,
  type: GqlType,
  opts: { importPrefix?: string; useProtobufjs?: boolean }
): ts.MethodDeclaration {
  if (field.type instanceof ProtoEnum) {
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
      createFieldResolverBlockForEnum(field, type, field.type, opts)
    );
  }

  let resolverRet: ts.Expression = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier("root"),
    ts.factory.createIdentifier(
      opts.useProtobufjs
        ? camelCase(field.descriptor.getName()!)
        : field.getterName
    )
  );

  if (!opts.useProtobufjs) {
    resolverRet = ts.factory.createCallExpression(
      resolverRet,
      undefined,
      undefined
    );
  }

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
  } else if (opts.useProtobufjs && !type.nullable) {
    resolverRet = ts.factory.createNonNullExpression(resolverRet);
  }

  if (opts.useProtobufjs && type.kind === "enum" && type.nullable) {
    resolverRet = ts.factory.createBinaryExpression(
      resolverRet,
      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
      ts.factory.createToken(ts.SyntaxKind.NullKeyword)
    );
  }

  const unwrapFunc = getUnwrapFunc(field, opts);
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

/**
 * @example nullable
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   return null
 * }
 * return root.myEnum
 * ```
 * @example notNull
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   throw new Error("Message.field is required field. but got null or unspecified.")
 * }
 * return root.myEnum
 * ```
 */
function createFieldResolverBlockForEnum(
  field: ProtoField,
  type: GqlType,
  en: ProtoEnum,
  opts: { importPrefix?: string; useProtobufjs?: boolean }
): ts.Block {
  const value = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier("root"),
    ts.factory.createIdentifier(
      opts.useProtobufjs
        ? camelCase(field.descriptor.getName()!)
        : field.getterName
    )
  );
  let whenNullStmt: ts.Statement = type.nullable
    ? ts.factory.createReturnStatement(
        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
      )
    : ts.factory.createThrowStatement(
        ts.factory.createNewExpression(
          ts.factory.createIdentifier("Error"),
          undefined,
          [
            ts.factory.createStringLiteral(
              `${gqlTypeName(field.parent)}.${
                field.name
              } is required field. But got null or unspecified.`
            ),
          ]
        )
      );
  whenNullStmt = ts.factory.createBlock(
    [whenNullStmt],
    true // multiline
  );
  const unspecified = getEnumValueForUnspecified(en);

  return ts.factory.createBlock(
    [
      ts.factory.createIfStatement(
        ts.factory.createBinaryExpression(
          value,
          ts.SyntaxKind.EqualsEqualsToken,
          ts.factory.createToken(ts.SyntaxKind.NullKeyword)
        ),
        whenNullStmt
      ),
      unspecified
        ? ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              value,
              ts.SyntaxKind.EqualsEqualsEqualsToken,
              ts.factory.createPropertyAccessExpression(
                createProtoExpr(field.type!, opts),
                ts.factory.createIdentifier(unspecified.name)
              )
            ),
            whenNullStmt
          )
        : null,
      ts.factory.createReturnStatement(value),
    ].filter(onlyNonNull()),
    true // multiline
  );
}
