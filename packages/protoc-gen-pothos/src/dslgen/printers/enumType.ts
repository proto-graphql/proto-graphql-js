import type { Registry } from "@bufbuild/protobuf";
import {
  type EnumType,
  createProtoTypeExpr,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";

import {
  type GeneratedFile,
  type Printable,
  createImportSymbol,
} from "@bufbuild/protoplugin";
import { type PothosPrinterOptions, pothosBuilder, pothosRef } from "./util.js";

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
export function printEnumTypeCode(
  g: GeneratedFile,
  type: EnumType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const refIdent = pothosRef(type);
  const protoTypeExpr = createProtoTypeExpr(type.proto, opts);
  const coreRefFuncExpr = createImportSymbol("EnumRef", "@pothos/core", true);
  // EnumRef<Hello, Hello>
  // biome-ignore format: to make it easy generated code to read
  const refTypeExpr: Printable = [coreRefFuncExpr, "<", protoTypeExpr, ",", protoTypeExpr, ">"];

  const builderExpr = pothosBuilder(type, opts);

  g.print(" export const ", refIdent, ": ", refTypeExpr, " =");
  g.print(builderExpr, ".enumType(", g.string(type.typeName), ", {");

  if (type.description) {
    g.print("  description: ", g.string(type.description), ",");
  }

  g.print("  values: {");
  for (const ev of type.values) {
    if (ev.isIgnored() || ev.isUnespecified()) continue;
    g.print(ev.name, ": {");
    if (ev.description) {
      g.print("    description: ", g.string(ev.description), ",");
    }
    if (ev.deprecationReason) {
      g.print("    deprecationReason: ", g.string(ev.deprecationReason), ",");
    }
    g.print("    value: ", ev.number, ",");
    const extJson = JSON.stringify(protobufGraphQLExtensions(ev, registry));
    g.print("    extensions: ", extJson, ",");
    g.print("  },");
  }
  g.print("  } as const,");

  const extJson = JSON.stringify(protobufGraphQLExtensions(type, registry));
  g.print("    extensions: ", extJson, ",");

  g.print("})");
}
