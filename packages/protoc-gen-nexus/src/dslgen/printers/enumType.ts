import {
  compact,
  EnumType,
  protobufGraphQLExtensions,
  Registry,
} from "@proto-graphql/codegen-core";
import { code, Code, literalOf } from "ts-poet";

import { impNexus, nexusTypeDef } from "./util";

/**
 * @example
 * ```ts
 * export cosnt Hello = enumType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createEnumTypeCode(type: EnumType, registry: Registry): Code {
  const typeOpts = {
    name: type.typeName,
    description: type.description,
    members: type.values.map((ev) => ({
      name: ev.name,
      value: ev.number,
      description: ev.description,
      deprecation: ev.deprecationReason,
      extensions: protobufGraphQLExtensions(ev, registry),
    })),
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`export const ${nexusTypeDef(type)} = ${impNexus(
    "enumType",
  )}(${literalOf(compact(typeOpts))});`;
}
