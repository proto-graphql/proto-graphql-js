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
} from "@proto-graphql/codegen-core";
import { ProtoField } from "@proto-graphql/proto-descriptors";
import { code, Code, literalOf } from "ts-poet";
import { createEnumResolverCode } from "./fieldResolver/enumFieldResolver";
import { createNonNullResolverCode } from "./fieldResolver/nonNullResolver";
import { createOneofUnionResolverCode } from "./fieldResolver/oneofUnionResolver";
import { fieldTypeRef, PothosPrinterOptions } from "./util";

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
  opts: PothosPrinterOptions
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
      resolverCode = createOneofUnionResolverCode(sourceExpr, field);
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
        resolverCode = createOneofUnionResolverCode(valueExpr, field);
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
    extensions: protobufGraphQLExtensions(field),
  };

  const shouldUseFieldFunc = isInput || resolverCode != null;
  return shouldUseFieldFunc
    ? code`t.field(${literalOf(compact(fieldOpts))})`
    : code`t.expose(${literalOf(
        (field.proto as ProtoField).jsonName
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
