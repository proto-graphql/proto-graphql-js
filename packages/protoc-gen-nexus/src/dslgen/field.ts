import ts from "typescript";
import { ProtoField, ProtoRegistry } from "../protoTypes";
import { detectGqlType, GenerationParams, GqlType } from "./types";
import { createDeprecationPropertyAssignment, onlyNonNull } from "./util";
import { createFieldResolverDecl } from "./fieldResolvers";

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
  opts: GenerationParams & { input?: boolean }
): ts.Statement {
  const type = detectGqlType(field, registry, opts);
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
      undefined,
      [ts.factory.createStringLiteral(field.name), createFieldOptionExpr(field, type, opts)]
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
  opts: GenerationParams & { input?: boolean }
): ts.Expression {
  const createTypeSpecifier = (type: GqlType): ts.Expression => {
    switch (type.kind) {
      case "list":
        return ts.factory.createCallExpression(ts.factory.createIdentifier("list"), undefined, [
          createTypeSpecifier(type.type),
        ]);
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
      ts.factory.createPropertyAssignment("description", ts.factory.createStringLiteral(field.description)),
      createDeprecationPropertyAssignment(field),
      opts?.input
        ? null
        : createFieldResolverDecl(field, type, {
            importPrefix: opts.importPrefix,
            useProtobufjs: opts.useProtobufjs,
          }),
    ].filter(onlyNonNull()),
    true
  );
}
