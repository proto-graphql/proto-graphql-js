import { EnumType } from "@proto-graphql/codegen-core";
import { code, Code, joinCode, literalOf } from "ts-poet";
import { compact, pothosBuilder, PothosPrinterOptions, pothosRef } from "./util";

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
export function createEnumTypeCode(type: EnumType, opts: PothosPrinterOptions): Code {
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
    extensions: {
      protobufEnum: {
        name: type.proto.name,
        fullName: type.proto.fullName.toString(),
        package: type.proto.file.package,
      },
    },
  };
  return code`
    export const ${pothosRef(type)} =
      ${pothosBuilder(type, opts)}.enumType(${literalOf(type.typeName)}, ${literalOf(compact(typeOpts))});
  `;
}
