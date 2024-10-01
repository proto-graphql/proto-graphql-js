import type { Registry } from "@bufbuild/protobuf";
import {
  type OneofUnionType,
  type SquashedOneofUnionType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";

import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  type PothosPrinterOptions,
  fieldTypeRef,
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
export function printOneofUnionTypeCode(
  g: GeneratedFile,
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  g.print("export const ", pothosRef(type), " =");
  g.print(pothosBuilder(type, opts), ".unionType(");
  g.print(g.string(type.typeName), ", ");
  g.print("{");
  g.print("  types: [");
  for (const f of type.fields) {
    g.print(fieldTypeRef(f, opts), ",");
  }
  g.print("  ],");
  if (type.description) {
    g.print("  description: ", g.string(type.description), ",");
  }

  const extJson = JSON.stringify(protobufGraphQLExtensions(type, registry));
  g.print("  extensions: ", extJson, ",");

  g.print("},");

  g.print(")");
}
