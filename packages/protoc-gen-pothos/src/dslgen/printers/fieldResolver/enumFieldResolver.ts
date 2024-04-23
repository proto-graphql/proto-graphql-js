import {
  EnumType,
  ObjectField,
  PrinterOptions,
  protoType,
} from "@proto-graphql/codegen-core";
import { Code, code } from "ts-poet";

/**
 * @example nullable
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   return null
 * }
 * return root.myEnum
 * ```
 * @example notNull
 * ```ts
 * if (!root.myEnum || root.myEnum === _$enums.myEnum.MY_ENUM_UNSPECIFIED) {
 *   throw new Error("Message.field is required field. but got null or unspecified.")
 * }
 * return root.myEnum
 * ```
 */
export function createEnumResolverCode(
  valueExpr: Code,
  field: ObjectField<EnumType>,
  opts: PrinterOptions,
): Code {
  const createBlockStmtCodes = (valueExpr: Code): Code[] => {
    const chunks: Code[] = [];

    if (field.type.unspecifiedValue != null) {
      const escapeCode =
        field.isNullable() && !field.isList()
          ? code`return null;`
          : code`throw new Error("${field.name} is required field. But got unspecified.");`;
      chunks.push(code`
        if (${valueExpr} === ${protoType(field.type.proto, opts)}.${
          field.type.unspecifiedValue.proto.name
        }) {
          ${escapeCode}
        }
      `);
    }
    for (const ev of field.type.valuesWithIgnored) {
      if (!ev.isIgnored()) continue;
      chunks.push(code`
      if (${valueExpr} === ${protoType(field.type.proto, opts)}.${ev.proto.name}) {
        throw new Error("${ev.name} is ignored in GraphQL schema");
      }
    `);
    }

    return chunks;
  };

  if (field.isList()) {
    const stmts = createBlockStmtCodes(code`item`);
    if (stmts.length === 0) {
      return code`return ${valueExpr}`;
    }
    return code`return ${valueExpr}.map(item => {
      ${stmts}
      return item;
    })`;
  }

  return code`
    ${createBlockStmtCodes(valueExpr)}
    return ${valueExpr};
  `;
}
