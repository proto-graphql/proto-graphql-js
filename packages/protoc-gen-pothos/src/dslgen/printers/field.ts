import type { createRegistry, DescField } from "@bufbuild/protobuf";
import {
  compact,
  createGetFieldValueCode,
  EnumType,
  InputObjectField,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  protobufGraphQLExtensions,
  ScalarType,
  SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import { type Code, code, literalOf } from "ts-poet";

import { createEnumResolverCode } from "./fieldResolver/enumFieldResolver.js";
import { createNonNullResolverCode } from "./fieldResolver/nonNullResolver.js";
import { createOneofUnionResolverCode } from "./fieldResolver/oneofUnionResolver.js";
import { fieldTypeRef, type PothosPrinterOptions } from "./util.js";

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
export function createFieldRefCode(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>,
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): Code {
  const isInput = field instanceof InputObjectField;
  const baseType =
    field.type instanceof ScalarType
      ? literalOf(field.type.typeName)
      : fieldTypeRef(field, opts);

  const sourceExpr = code`source`;
  let resolverCode: Code | undefined;
  if (!isInput) {
    if (field instanceof ObjectOneofField) {
      resolverCode = createOneofUnionResolverCode(sourceExpr, field, opts);
    } else {
      const valueExpr = createGetFieldValueCode(sourceExpr, field.proto, opts);
      const nullableInProto =
        field.type instanceof ObjectType ||
        (field.type instanceof ScalarType &&
          !field.type.isPrimitive() &&
          !field.type.isWrapperType());
      if (nullableInProto && !field.isNullable()) {
        resolverCode = createNonNullResolverCode(valueExpr);
      }
      if (field.type instanceof EnumType && field instanceof ObjectField) {
        resolverCode = createEnumResolverCode(valueExpr, field, opts);
      }
      if (
        field.type instanceof SquashedOneofUnionType &&
        field instanceof ObjectField
      ) {
        resolverCode = createOneofUnionResolverCode(valueExpr, field, opts);
      }
      if (field.type instanceof ScalarType && field.type.isBytes()) {
        if (field.isList()) {
          resolverCode = code`return ${valueExpr}.map(v => Buffer.from(v));`;
        } else if (field.isNullable()) {
          resolverCode = code`return ${valueExpr} == null ? null : Buffer.from(${valueExpr});`;
        } else {
          resolverCode = code`return Buffer.from(${valueExpr});`;
        }
      }
    }
  }

  const nullableValue = isInput !== field.isNullable(); /* Logical XOR */
  const fieldOpts = {
    type: field.isList() ? code`[${baseType}]` : baseType,
    [isInput ? "required" : "nullable"]: field.isList()
      ? { list: nullableValue, items: isInput /* always non-null */ }
      : nullableValue,
    description: field.description,
    deprecationReason: field.deprecationReason,
    resolve: resolverCode ? code`${sourceExpr} => {${resolverCode}}` : null,
    extensions: protobufGraphQLExtensions(field, registry),
  };

  const shouldUseFieldFunc = isInput || resolverCode != null;
  return shouldUseFieldFunc
    ? code`t.field(${literalOf(compact(fieldOpts))})`
    : code`t.expose(${literalOf(
        tsFieldName(field.proto as DescField, opts),
      )}, ${literalOf(compact(fieldOpts))})`;
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
export function createNoopFieldRefCode(opts: { input: boolean }): Code {
  return code`
    t.field({
      type: "Boolean",
      ${opts.input ? "required: false" : "nullable: true"},
      description: "noop field",
      ${opts.input ? "" : "resolve: () => true,"}
    })
  `;
}
