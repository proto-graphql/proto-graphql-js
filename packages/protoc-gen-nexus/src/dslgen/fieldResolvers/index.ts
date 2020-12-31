import ts from "typescript";
import { camelCase } from "change-case";
import { ProtoEnum, ProtoField, ProtoOneof } from "../../protoTypes";
import { GenerationParams, GqlType } from "../types";
import { createEnumFieldResolverStmts } from "./enumFieldResolver";
import { createObjectFieldResolverStmts } from "./objectFieldResolver";
import { craeteOneofUnionFieldResolverStmts } from "./oneoUnionfFieldResolver";
import { createScalarFieldResolverStmts } from "./scalarFieldResolver";

export function createFieldResolverDecl(
  field: ProtoField,
  type: GqlType,
  opts: GenerationParams
): ts.MethodDeclaration {
  return createMethodDeclWithValueExpr(field, type, opts, (valueExpr) =>
    field.type instanceof ProtoEnum
      ? createEnumFieldResolverStmts(valueExpr, field, type, field.type, opts)
      : type.kind === "scalar"
      ? createScalarFieldResolverStmts(valueExpr, field, opts)
      : createObjectFieldResolverStmts(valueExpr, type)
  );
}

export function createOneofFieldResolverDecl(
  oneof: ProtoOneof,
  opts: GenerationParams
): ts.MethodDeclaration {
  return createMethodDecl(craeteOneofUnionFieldResolverStmts(oneof, opts));
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
