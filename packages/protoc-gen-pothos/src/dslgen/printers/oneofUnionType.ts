import type { Registry } from "@bufbuild/protobuf";
import {
  type OneofUnionType,
  protobufGraphQLExtensions,
  type SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import {
  code,
  compactForCodegen,
  literalOf,
  type Printable,
} from "../../codegen/index.js";
import {
  fieldTypeRefPrintable,
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefPrintable,
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
): Printable[] {
  const typeOpts = {
    types: type.fields.map((f) => fieldTypeRefPrintable(f, opts)),
    description: type.description,
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`
    export const ${pothosRefPrintable(type)} =
      ${pothosBuilderPrintable(type, opts)}.unionType(${literalOf(
        type.typeName,
      )}, ${literalOf(compactForCodegen(typeOpts))});
  `;
}
