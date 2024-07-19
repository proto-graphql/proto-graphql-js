import {
  type OneofUnionType,
  type Registry,
  type SquashedOneofUnionType,
  compact,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, literalOf } from "ts-poet";

import {
  type PothosPrinterOptions,
  fieldTypeRef,
  pothosBuilder,
  pothosRef,
} from "./util";

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
