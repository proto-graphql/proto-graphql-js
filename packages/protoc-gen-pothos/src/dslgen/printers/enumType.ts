import type { Registry } from "@bufbuild/protobuf";
import {
  type EnumType,
  jsStringLit,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";

import {
  code,
  createImportSymbol,
  joinCode,
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
  const valuesBlock = code`{${joinCode(
    type.values
      .filter((v) => !v.isIgnored() && !v.isUnespecified())
      .map((ev) => {
        const descEntry =
          ev.description != null
            ? code`\n        "description": ${jsStringLit(ev.description)},`
            : "";
        const deprecationEntry =
          ev.deprecationReason != null
            ? code`\n        "deprecationReason": ${jsStringLit(ev.deprecationReason)},`
            : "";
        return code`${ev.name}: {${descEntry}${deprecationEntry}
        "value": ${String(ev.number)},
        "extensions": ${protobufGraphQLExtensions(ev, registry)},
      },`;
      }),
  )}} as const`;

  const protoTypeExpr = protoTypeSymbol(type.proto, opts);
  const enumRefSymbol = createImportSymbol("EnumRef", "@pothos/core");
  // EnumRef<Hello, Hello>
  const refTypeExpr = code`${enumRefSymbol}<${protoTypeExpr}, ${protoTypeExpr}>`;

  const descriptionEntry =
    type.description != null
      ? code`\n      "description": ${jsStringLit(type.description)},`
      : "";

  return code`
    export const ${pothosRefPrintable(type)}: ${refTypeExpr} =
      ${pothosBuilderPrintable(opts)}.enumType(${jsStringLit(
        type.typeName,
      )}, {${descriptionEntry}
      "values": ${valuesBlock},
      "extensions": ${protobufGraphQLExtensions(type, registry)},
    });
  `;
}
