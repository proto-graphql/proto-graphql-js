import {
  compact,
  OneofUnionType,
  protobufGraphQLExtensions,
  Registry,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { code, Code, literalOf } from "ts-poet";

import { pothosBuilder, PothosPrinterOptions, pothosRef } from "./util";

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
    types: type.fields.map((f) => pothosRef(f.type)),
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
