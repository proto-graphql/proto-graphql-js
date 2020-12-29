import ts from "typescript";
import { camelCase } from "change-case";
import { ProtoEnum, ProtoField, ProtoOneof } from "../../protoTypes";
import { GenerationParams, GqlType } from "../types";
import { createEnumFieldResolverStmts } from "./enumFieldResolver";
import { createObjectFieldResolverStmts } from "./objectFieldResolver";
import { craeteOneofUnionFieldResolverStmts } from "./oneoUnionfFieldResolver";
import { createScalarFieldResolverStmts } from "./scalarFieldResolver";
import { isSquashedUnion } from "../util";

export function createFieldResolverDecl(
  field: ProtoField,
  type: GqlType,
  opts: GenerationParams
): ts.MethodDeclaration {
  return createMethodDeclWithValueExpr(field, type, opts, (valueExpr) => {
    if (field.type instanceof ProtoEnum) {
      return createEnumFieldResolverStmts(
        valueExpr,
        field,
        type,
        field.type,
        opts
      );
    }
    if (field.type == null || type.kind === "scalar") {
      return createScalarFieldResolverStmts(valueExpr, field, opts);
    }
    if (isSquashedUnion(field.type)) {
      const oneof = field.type.oneofs[0];
      const stmts = [];
      let oneofRoot = valueExpr;
      if (type.nullable) {
        oneofRoot = ts.factory.createIdentifier("value");
        stmts.push(
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  "value",
                  undefined,
                  undefined,
                  valueExpr
                ),
              ],
              ts.NodeFlags.Const
            )
          ),
          ts.factory.createIfStatement(
            ts.factory.createBinaryExpression(
              oneofRoot,
              ts.SyntaxKind.EqualsEqualsToken,
              ts.factory.createToken(ts.SyntaxKind.NullKeyword)
            ),
            ts.factory.createBlock(
              [
                ts.factory.createReturnStatement(
                  ts.factory.createToken(ts.SyntaxKind.NullKeyword)
                ),
              ],
              true // multiline
            )
          )
        );
      }
      return [
        ...stmts,
        ...craeteOneofUnionFieldResolverStmts(oneofRoot, oneof, opts),
      ];
    }
    return createObjectFieldResolverStmts(valueExpr, type);
  });
}

export function createOneofFieldResolverDecl(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.MethodDeclaration {
  return createMethodDecl(
    craeteOneofUnionFieldResolverStmts(
      ts.factory.createIdentifier("root"),
      oneof,
      opts
    )
  );
}

function createMethodDeclWithValueExpr(
  field: ProtoField,
  type: GqlType,
  opts: GenerationParams,
  stmtsFn: (valueExpr: ts.Expression) => ts.Statement[]
): ts.MethodDeclaration {
  let valueExpr: ts.Expression = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier("root"),
    ts.factory.createIdentifier(
      opts.useProtobufjs
        ? camelCase(field.descriptor.getName()!)
        : field.getterName
    )
  );
  if (!opts.useProtobufjs) {
    valueExpr = ts.factory.createCallExpression(
      valueExpr,
      undefined,
      undefined
    );
  }
  if (
    !type.nullable &&
    !(
      // google-protobuf, primitive field
      (
        !opts.useProtobufjs &&
        type.kind === "scalar" &&
        !field.descriptor.getTypeName()
      )
    )
  ) {
    valueExpr = ts.factory.createNonNullExpression(valueExpr);
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
    ts.factory.createBlock(
      stmtsFn(valueExpr),
      true // multiline
    )
  );
}

function createMethodDecl(stmts: ts.Statement[]): ts.MethodDeclaration {
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
    ts.factory.createBlock(
      stmts,
      true // multiline
    )
  );
}
