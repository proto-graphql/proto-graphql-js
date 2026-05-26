import type { Registry } from "@bufbuild/protobuf";
import {
  jsStringLit,
  type OneofUnionType,
  protobufGraphQLExtensions,
  type SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";

import { code, joinCode, type Printable } from "../../codegen/index.js";
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
  const typesArrayBody = joinCode(
    type.fields.map((f) => fieldTypeRefPrintable(f, opts)),
    ", ",
  );
  const descriptionEntry =
    type.description != null
      ? code`\n      "description": ${jsStringLit(type.description)},`
      : "";
  return code`
    export const ${pothosRefPrintable(type)} =
      ${pothosBuilderPrintable(opts)}.unionType(${jsStringLit(
        type.typeName,
      )}, {
      "types": [${typesArrayBody}],${descriptionEntry}
      "extensions": ${protobufGraphQLExtensions(type, registry)},
    });
  `;
}
