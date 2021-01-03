import ts from "typescript";
import { camelCase } from "change-case";
import { ProtoEnum, ProtoField, ProtoOneof } from "../../protoTypes";
import { GenerationParams, GqlType } from "../types";
import { createEnumFieldResolverStmts } from "./enumFieldResolver";
import { createObjectFieldResolverStmts } from "./objectFieldResolver";
import { craeteOneofUnionFieldResolverStmts } from "./oneoUnionfFieldResolver";
import { createScalarFieldResolverStmts } from "./scalarFieldResolver";
import { isSquashedUnion, onlyNonNull } from "../util";

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
      return craeteOneofUnionFieldResolverStmts(valueExpr, oneof, opts);
    }
    return createObjectFieldResolverStmts(valueExpr);
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
  const shouldNullCheck = !(
    // google-protobuf, primitive or list field
    (
      !opts.useProtobufjs &&
      (type.kind === "list" ||
        (type.kind === "scalar" && !field.descriptor.getTypeName()))
    )
  );

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
      [
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
        shouldNullCheck
          ? ts.factory.createIfStatement(
              ts.factory.createBinaryExpression(
                ts.factory.createIdentifier("value"),
                ts.SyntaxKind.EqualsEqualsToken,
                ts.factory.createToken(ts.SyntaxKind.NullKeyword)
              ),
              ts.factory.createBlock(
                [
                  type.nullable
                    ? ts.factory.createReturnStatement(
                        ts.factory.createToken(ts.SyntaxKind.NullKeyword)
                      )
                    : ts.factory.createThrowStatement(
                        ts.factory.createNewExpression(
                          ts.factory.createIdentifier("Error"),
                          undefined,
                          [
                            ts.factory.createStringLiteral(
                              "Cannot return null for non-nullable field"
                            ),
                          ]
                        )
                      ),
                ],
                true // multiline
              )
            )
          : null,
        ...stmtsFn(ts.factory.createIdentifier("value")),
      ].filter(onlyNonNull()),
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
