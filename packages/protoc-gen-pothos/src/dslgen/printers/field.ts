import type { createRegistry, DescField } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectField,
  jsStringLit,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  protobufGraphQLExtensions,
  ScalarType,
  SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import { code, type Printable } from "../../codegen/index.js";
import { createEnumResolverCode } from "./fieldResolver/enumFieldResolver.js";
import { createNonNullResolverCode } from "./fieldResolver/nonNullResolver.js";
import { createOneofUnionResolverCode } from "./fieldResolver/oneofUnionResolver.js";
import { fieldTypeRefPrintable, type PothosPrinterOptions } from "./util.js";

function createGetFieldValueCodePrintable(
  source: string,
  proto: DescField,
  opts: PothosPrinterOptions,
): Printable[] {
  return code`${source}.${tsFieldName(proto, opts)}`;
}

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
): Printable[] {
  const isInput = field instanceof InputObjectField;
  const baseType: string | Printable[] =
    field.type instanceof ScalarType
      ? jsStringLit(field.type.typeName)
      : fieldTypeRefPrintable(field, opts);

  const sourceExpr = "source";
  let resolverCode: Printable[] | undefined;
  if (!isInput) {
    if (field instanceof ObjectOneofField) {
      resolverCode = createOneofUnionResolverCode(
        code`${sourceExpr}`,
        field,
        opts,
      );
    } else {
      const valueExpr = createGetFieldValueCodePrintable(
        sourceExpr,
        field.proto,
        opts,
      );
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
  const typeExpr: Printable[] = field.isList()
    ? code`[${baseType}]`
    : typeof baseType === "string"
      ? code`${baseType}`
      : baseType;
  const nullabilityKey = isInput ? "required" : "nullable";
  const nullabilityVal = field.isList()
    ? `{ "list": ${String(nullableValue)}, "items": ${String(isInput) /* always non-null */} }`
    : String(nullableValue);
  const resolveEntry = resolverCode
    ? code`\n      "resolve": ${sourceExpr} => {${resolverCode}},`
    : "";
  const descriptionEntry =
    field.description != null
      ? code`\n      "description": ${jsStringLit(field.description)},`
      : "";
  const deprecationEntry =
    field.deprecationReason != null
      ? code`\n      "deprecationReason": ${jsStringLit(field.deprecationReason)},`
      : "";

  const fieldOptsCode = code`{
      "type": ${typeExpr},
      "${nullabilityKey}": ${nullabilityVal},${descriptionEntry}${deprecationEntry}${resolveEntry}
      "extensions": ${protobufGraphQLExtensions(field, registry)},
    }`;

  const shouldUseFieldFunc = isInput || resolverCode != null;
  return shouldUseFieldFunc
    ? code`t.field(${fieldOptsCode})`
    : code`t.expose(${jsStringLit(
        tsFieldName(field.proto as DescField, opts).toString(),
      )}, ${fieldOptsCode})`;
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
export function createNoopFieldRefCode(opts: { input: boolean }): Printable[] {
  return code`
    t.field({
      type: "Boolean",
      ${opts.input ? "required: false" : "nullable: true"},
      description: "noop field",
      ${opts.input ? "" : "resolve: () => true,"}
    })
  `;
}
