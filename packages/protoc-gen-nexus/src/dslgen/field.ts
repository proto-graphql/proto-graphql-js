import ts from "typescript";
import { ProtoField, ProtoRegistry } from "../protogen";
import { detectGqlType, GenerationParams, GqlType } from "./types";
import {
  createDeprecationPropertyAssignment,
  createDescriptionPropertyAssignment,
  createNexusCallExpr,
  onlyNonNull,
} from "./util";
import { createFieldResolverDecl } from "./fieldResolvers";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

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
  const name = field.descriptor.getOptions()?.getExtension(extensions.field)?.getName() || field.jsonName;
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("t"), ts.factory.createIdentifier("field")),
      undefined,
      [ts.factory.createStringLiteral(name), createFieldOptionExpr(field, type, opts)]
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
        return createNexusCallExpr("list", [createTypeSpecifier(type.type)]);
      case "object":
      case "scalar":
      case "enum":
        return createNexusCallExpr(type.nullable ? "nullable" : "nonNull", [ts.factory.createStringLiteral(type.type)]);
      default:
        const _exhaustiveCheck: never = type; // eslint-disable-line
        throw "unreachable";
    }
  };

  return ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment("type", createTypeSpecifier(type)),
      createDescriptionPropertyAssignment(field),
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
