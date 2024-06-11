import {
  type EnumType,
  type Registry,
  compact,
  protobufGraphQLExtensions,
  protoType,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode, literalOf, imp } from "ts-poet";

import { type PothosPrinterOptions, pothosBuilder, pothosRef } from "./util";

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
): Code {
  const typeOpts = {
    description: type.description,
    values: code`{${joinCode(
      type.values
        .filter((v) => !v.isIgnored() && !v.isUnespecified())
        .map(
          (ev) =>
            code`${ev.name}: ${literalOf(
              compact({
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

  const protoTypeExpr = protoType(type.proto, opts);
  // EnumRef<Hello, Hello>
  const refTypeExpr = code`${imp(
    "EnumRef@@pothos/core",
  )}<${protoTypeExpr}, ${protoTypeExpr}>`;

  return code`
    export const ${pothosRef(type)}: ${refTypeExpr} =
      ${pothosBuilder(type, opts)}.enumType(${literalOf(
        type.typeName,
      )}, ${literalOf(compact(typeOpts))});
  `;
}
