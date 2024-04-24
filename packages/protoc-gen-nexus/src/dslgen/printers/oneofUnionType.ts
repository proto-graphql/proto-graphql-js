import {
  type OneofUnionType,
  type Registry,
  type SquashedOneofUnionType,
  compact,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode, literalOf } from "ts-poet";

import {
  type NexusPrinterOptions,
  fieldType,
  impNexus,
  nexusTypeDef,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt Oneof = unionType({
 *   name: "Oneof",
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeCode(
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: NexusPrinterOptions,
): Code {
  const typeOpts = {
    name: type.typeName,
    description: type.description,
    definition: code`(t) => {
      t.members(${joinCode(
        type.fields.map((f) => fieldType(f, opts)),
        { on: "," },
      )});
    }`,
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`export const ${nexusTypeDef(type)} = ${impNexus(
    "unionType",
  )}(${literalOf(compact(typeOpts))});`;
}
