import type { Registry } from "@bufbuild/protobuf";
import {
  compact,
  type OneofUnionType,
  protobufGraphQLExtensions,
  type SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { type Code, code, literalOf } from "ts-poet";

import {
  fieldTypeRef,
  type PothosPrinterOptions,
  pothosBuilder,
  pothosRef,
} from "./util.js";

/**
 * @example
 * ```ts
 * export cosnt Oneof = builder.unionType("Oneof", {
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeCode(
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  const typeOpts = {
    types: type.fields.map((f) => fieldTypeRef(f, opts)),
    description: type.description,
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`
    export const ${pothosRef(type)} =
      ${pothosBuilder(type, opts)}.unionType(${literalOf(
        type.typeName,
      )}, ${literalOf(compact(typeOpts))});
  `;
}
