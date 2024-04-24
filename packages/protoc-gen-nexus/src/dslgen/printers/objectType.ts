import {
  InterfaceType,
  type ObjectType,
  type Registry,
  compact,
  protoType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode, literalOf } from "ts-poet";

import {
  createFieldDefinitionCode,
  createNoopFieldDefinitionCode,
} from "./field";
import { type NexusPrinterOptions, impNexus, nexusTypeDef } from "./util";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeCode(
  type: ObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): Code {
  const isInterface = type instanceof InterfaceType;
  const reExportedPbTypeName = type.proto.typeName.replace(/\./g, "$");
  const typeOpts = {
    name: type.typeName,
    description: type.description,
    definition: code`(t) => {
      ${
        type.fields.length > 0
          ? joinCode(
              type.fields.map((f) =>
                createFieldDefinitionCode(f, registry, opts),
              ),
            )
          : createNoopFieldDefinitionCode({ input: false })
      }
    }`,
    isTypeOf: isInterface
      ? null
      : code`
        (data: unknown) => {
          return data instanceof ${protoType(type.proto, opts)}
        }
      `,
    sourceType: isInterface
      ? null
      : {
          module: code`__filename`,
          export: reExportedPbTypeName,
        },
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`
    export type ${reExportedPbTypeName} = ${protoType(type.proto, opts)};
    export const ${nexusTypeDef(type)} =
      ${impNexus(isInterface ? "interfaceType" : "objectType")}(${literalOf(
        compact(typeOpts),
      )});
  `;
}
