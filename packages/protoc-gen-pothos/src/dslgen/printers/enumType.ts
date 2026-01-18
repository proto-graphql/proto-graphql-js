import type { Registry } from "@bufbuild/protobuf";
import {
  type EnumType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";

import {
  code,
  compactForCodegen,
  createImportSymbol,
  joinCode,
  literalOf,
  type Printable,
} from "../../codegen/index.js";
import {
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefPrintable,
  protoTypeSymbol,
} from "./util.js";

/**
 * @example
 * ```ts
 * export cosnt Hello$Ref: EnumRef<Hello, Hello> = builder.enumType("Hello", {
 *   values: [
 *     // ...
 *   ],
 *   // ...
 * })
 * ```
 */
export function createEnumTypeCode(
  type: EnumType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Printable[] {
  const typeOpts = {
    description: type.description,
    values: code`{${joinCode(
      type.values
        .filter((v) => !v.isIgnored() && !v.isUnespecified())
        .map(
          (ev) =>
            code`${ev.name}: ${literalOf(
              compactForCodegen({
                description: ev.description,
                deprecationReason: ev.deprecationReason,
                value: ev.number,
                extensions: protobufGraphQLExtensions(ev, registry),
              }),
            )},`,
        ),
    )}} as const`,
    extensions: protobufGraphQLExtensions(type, registry),
  };

  const protoTypeExpr = protoTypeSymbol(type.proto, opts);
  const enumRefSymbol = createImportSymbol("EnumRef", "@pothos/core");
  // EnumRef<Hello, Hello>
  const refTypeExpr = code`${enumRefSymbol}<${protoTypeExpr}, ${protoTypeExpr}>`;

  return code`
    export const ${pothosRefPrintable(type)}: ${refTypeExpr} =
      ${pothosBuilderPrintable(type, opts)}.enumType(${literalOf(
        type.typeName,
      )}, ${literalOf(compactForCodegen(typeOpts))});
  `;
}
