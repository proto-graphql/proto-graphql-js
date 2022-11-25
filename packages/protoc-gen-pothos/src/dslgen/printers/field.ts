import {
  EnumType,
  InputObjectField,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  ScalarType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import ts from "typescript";
import { createEnumResolverStmts } from "./fieldResolver/enumFieldResolver";
import { createNonNullResolverStmts } from "./fieldResolver/nonNullResolver";
import { createOneofUnionResolverStmts } from "./fieldResolver/oneofUnionResolver";
import { createDeprecationPropertyAssignment, createDescriptionPropertyAssignment, onlyNonNull } from "./util";

/**
 * @example
 * ```ts
 * t.expose("name", {
 *   type: "Boolean",
 *   nullable: true,
 *   description: "...",
 * })
 * ```
 * ```ts
 * t.field({
 *   type: "Boolean",
 *   nullable: true,
 *   description: "...",
 *   resolve() {
 *     return true
 *   }
 * })
 * ```
 */
export function createFieldDefinitionExpr(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): ts.Expression {
  let typeExpr: ts.Expression =
    field.type instanceof ScalarType
      ? ts.factory.createStringLiteral(field.type.typeName)
      : ts.factory.createIdentifier(field.type.pothosRefObjectName);

  const isInput = field instanceof InputObjectField;
  const nullableToken = ts.factory.createToken(
    isInput ? ts.SyntaxKind.FalseKeyword : ts.SyntaxKind.TrueKeyword
  ) as ts.Expression;
  const nonNullableToken = ts.factory.createToken(
    isInput ? ts.SyntaxKind.TrueKeyword : ts.SyntaxKind.FalseKeyword
  ) as ts.Expression;

  let nullableExpr: ts.Expression = field.isNullable() ? nullableToken : nonNullableToken;
  // let defaultValueExpr: ts.Expression | undefined;

  if (field.isList()) {
    typeExpr = ts.factory.createArrayLiteralExpression([typeExpr], false);
    // if (isInput) {
    //   defaultValueExpr = ts.factory.createArrayLiteralExpression([], false);
    // }
    nullableExpr = ts.factory.createObjectLiteralExpression(
      [
        ts.factory.createPropertyAssignment("list", nullableExpr),
        ts.factory.createPropertyAssignment("items", nonNullableToken),
      ],
      false
    );
  }

  let createResolveStmts: ((valueExpr: ts.Expression) => ts.Statement[]) | undefined;
  if (!isInput) {
    const nullableInProto =
      field.type instanceof ObjectType ||
      (field.type instanceof ScalarType && !field.type.isPrimitive() && !field.type.isWrapperType());
    if (nullableInProto && !field.isNullable()) {
      createResolveStmts = (sourceExpr) =>
        createNonNullResolverStmts(ts.factory.createPropertyAccessExpression(sourceExpr, field.protoJsName));
    }
    if (field.type instanceof EnumType && field instanceof ObjectField) {
      createResolveStmts = (sourceExpr) =>
        createEnumResolverStmts(ts.factory.createPropertyAccessExpression(sourceExpr, field.protoJsName), field);
    }
    if (field instanceof ObjectOneofField) {
      createResolveStmts = (sourceExpr) => createOneofUnionResolverStmts(sourceExpr, field);
    }
    if (field.type instanceof SquashedOneofUnionType && field instanceof ObjectField) {
      createResolveStmts = (sourceExpr) =>
        createOneofUnionResolverStmts(ts.factory.createPropertyAccessExpression(sourceExpr, field.protoJsName), field);
    }
  }

  const fieldOptionsExpr = ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", typeExpr),
      ts.factory.createPropertyAssignment(isInput ? "required" : "nullable", nullableExpr),
      createDescriptionPropertyAssignment(field),
      createDeprecationPropertyAssignment(field),
      // defaultValueExpr && ts.factory.createPropertyAssignment("defaultValue", defaultValueExpr),
      createResolveStmts && ts.factory.createPropertyAssignment("resolve", createResolverExpr(createResolveStmts)),
      ts.factory.createPropertyAssignment("extensions", createExtensionsObjectLiteralExpr(field)),
    ].filter(onlyNonNull()),
    true
  );

  const shouldUseFieldFunc = field instanceof InputObjectField || createResolveStmts != null;

  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("t"),
      ts.factory.createIdentifier(shouldUseFieldFunc ? "field" : "expose")
    ),
    undefined,
    shouldUseFieldFunc ? [fieldOptionsExpr] : [ts.factory.createStringLiteral(field.protoJsName), fieldOptionsExpr]
  );
}

/**
 * @example
 * ```ts
 * t.field( {
 *   type: "Boolean",
 *   nullable: true,
 *   description: "noop field",
 *   resolve() {
 *     return true
 *   }
 * })
 * ```
 */
export function createNoopFieldDefinitionExpr(opts: { input: boolean }): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
    undefined,
    [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment("type", ts.factory.createStringLiteral("Boolean")),
          opts.input
            ? ts.factory.createPropertyAssignment("required", ts.factory.createToken(ts.SyntaxKind.FalseKeyword))
            : ts.factory.createPropertyAssignment("nullable", ts.factory.createToken(ts.SyntaxKind.TrueKeyword)),
          ts.factory.createPropertyAssignment("description", ts.factory.createStringLiteral("noop field")),
          opts.input
            ? null
            : ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                undefined,
                "resolve",
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createBlock([
                  ts.factory.createReturnStatement(ts.factory.createToken(ts.SyntaxKind.TrueKeyword)),
                ])
              ),
        ].filter(onlyNonNull()),
        true
      ),
    ]
  );
}

function createResolverExpr(createStmts: (sourceExpr: ts.Expression) => ts.Statement[]): ts.Expression {
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, undefined, ts.factory.createIdentifier("source"))],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(createStmts(ts.factory.createIdentifier("source")), true)
  );
}

/**
 * @example
 * ```ts
 * ({
 *   protobufField: {
 *     name: "...",
 *   },
 * } as ProtobufFieldExtensions)
 * ```
 */
function createExtensionsObjectLiteralExpr(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): ts.Expression {
  let typeName: string | undefined;
  if ((field instanceof ObjectField || field instanceof InputObjectField) && field.proto.type !== null) {
    if (field.proto.type.kind === "Scalar") {
      typeName = field.proto.type.type;
    } else {
      typeName = field.proto.type.fullName.toString();
    }
  }
  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        "protobufField",
        ts.factory.createObjectLiteralExpression(
          [
            ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(field.proto.name)),
            typeName
              ? ts.factory.createPropertyAssignment("typeFullName", ts.factory.createStringLiteral(typeName))
              : undefined,
          ].filter(onlyNonNull()),
          true
        )
      ),
    ],
    true
  );
}
