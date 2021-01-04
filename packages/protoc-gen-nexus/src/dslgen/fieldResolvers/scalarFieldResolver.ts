import ts from "typescript";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { ProtoField } from "../../protogen";
import { GenerationParams } from "../types";
import { getUnwrapFunc } from "../unwrap";

export function createScalarFieldResolverStmts(
  valueExpr: ts.Expression,
  field: ProtoField,
  opts: GenerationParams
): ts.Statement[] {
  let resolverRet = valueExpr;

  const unwrapFunc = getUnwrapFunc(field, opts);
  if (unwrapFunc !== null) {
    resolverRet = ts.factory.createCallExpression(ts.factory.createIdentifier(unwrapFunc.name), undefined, [
      resolverRet,
    ]);
  }
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

  return [ts.factory.createReturnStatement(resolverRet)];
}
