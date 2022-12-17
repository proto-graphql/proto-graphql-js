import {
  compact,
  EnumType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { code, Code, joinCode, literalOf } from "ts-poet";

import { pothosBuilder, PothosPrinterOptions, pothosRef } from "./util";

/**
 * @example
 * ```ts
 * export cosnt Hello$Ref = builder.enumType("Hello", {
 *   values: [
 *     // ...
 *   ],
 *   // ...
 * })
 * ```
 */
export function createEnumTypeCode(
  type: EnumType,
  opts: PothosPrinterOptions
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
                extensions: {
                  protobufEnumValue: {
                    name: ev.proto.name,
                  },
                },
              })
            )},`
        )
    )}} as const`,
    extensions: protobufGraphQLExtensions(type),
  };
  return code`
    export const ${pothosRef(type)} =
      ${pothosBuilder(type, opts)}.enumType(${literalOf(
    type.typeName
  )}, ${literalOf(compact(typeOpts))});
  `;
}
