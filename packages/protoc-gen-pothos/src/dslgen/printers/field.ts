import type { DescField, createRegistry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectField,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  ScalarType,
  SquashedOneofUnionType,
  createGetFieldValueExpr,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import type { GeneratedFile } from "@bufbuild/protoplugin";
import { printEnumResolverStmts } from "./fieldResolver/enumFieldResolver.js";
import { printNonNullResolverStmts } from "./fieldResolver/nonNullResolver.js";
import { printOneofUnionResolverStmts } from "./fieldResolver/oneofUnionResolver.js";
import { type PothosPrinterOptions, fieldTypeRef } from "./util.js";

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
export function printFieldDefStmt(
  g: GeneratedFile,
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>,
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): void {
  const isInput = field instanceof InputObjectField;
  const baseType =
    field.type instanceof ScalarType
      ? g.string(field.type.typeName)
      : fieldTypeRef(field, opts);

  const sourceExpr = "source";
  let printResolver: (() => void) | undefined;
  if (!isInput) {
    if (field instanceof ObjectOneofField) {
      printResolver = () =>
        printOneofUnionResolverStmts(g, sourceExpr, field, opts);
    } else {
      const valueExpr = createGetFieldValueExpr(sourceExpr, field.proto, opts);
      const nullableInProto =
        field.type instanceof ObjectType ||
        (field.type instanceof ScalarType &&
          !field.type.isPrimitive() &&
          !field.type.isWrapperType());
      if (nullableInProto && !field.isNullable()) {
        printResolver = () => printNonNullResolverStmts(g, valueExpr);
      }
      if (field.type instanceof EnumType && field instanceof ObjectField) {
        printResolver = () => printEnumResolverStmts(g, valueExpr, field, opts);
      }
      if (
        field.type instanceof SquashedOneofUnionType &&
        field instanceof ObjectField
      ) {
        printResolver = () =>
          printOneofUnionResolverStmts(g, valueExpr, field, opts);
      }
      if (field.type instanceof ScalarType && field.type.isBytes()) {
        if (field.isList()) {
          printResolver = () =>
            g.print("return ", valueExpr, ".map(v => Buffer.from(v));");
        } else if (field.isNullable()) {
          printResolver = () => {
            g.print("return ", valueExpr, " == null");
            g.print("? null : Buffer.from(", valueExpr, ");");
          };
        } else {
          printResolver = () => g.print("return Buffer.from(", valueExpr, ");");
        }
      }
    }
  }

  const shouldUseFieldFunc = isInput || printResolver != null;
  if (shouldUseFieldFunc) {
    g.print("t.field({");
  } else {
    const fieldNameExpr = g.string(tsFieldName(field.proto as DescField, opts));
    g.print("t.expose(", fieldNameExpr, ", {");
  }

  g.print("  type:", field.isList() ? ["[", baseType, "]"] : baseType, ",");
  switch (true) {
    case !isInput && !field.isList(): // object
      g.print("  nullable: ", field.isNullable(), ",");
      break;
    case !isInput && field.isList(): // object list
      g.print("  nullable: { list: ", field.isNullable(), ", items: false },");
      break;
    case isInput && !field.isList(): // input
      g.print(" required: ", !field.isNullable(), ",");
      break;
    case isInput && field.isList(): // input list
      g.print(" required: { list: ", !field.isNullable(), ", items: true },");
      break;
  }

  if (field.description) {
    g.print("  description:", g.string(field.description), ",");
  }
  if (field.deprecationReason) {
    g.print("  deprecationReason:", g.string(field.deprecationReason), ",");
  }
  if (printResolver) {
    g.print("  resolve: (", sourceExpr, ") => {");
    printResolver();
    g.print("  },");
  }

  const extJson = JSON.stringify(protobufGraphQLExtensions(field, registry));
  g.print("extensions: ", extJson, ",");

  g.print("})");
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
export function printNoopFieldDefStmt(
  g: GeneratedFile,
  opts: { input: boolean },
): void {
  g.print("t.field({");
  g.print("  type: 'Boolean',");
  if (opts.input) {
    g.print("  required: false,");
  } else {
    g.print("  nullable: true,");
  }
  g.print("  description: 'noop field',");
  if (!opts.input) {
    g.print("  resolve: () => true,");
  }
  g.print("})");
}
