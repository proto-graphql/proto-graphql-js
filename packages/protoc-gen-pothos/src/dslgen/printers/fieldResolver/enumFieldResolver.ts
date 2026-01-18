import type {
  EnumType,
  EnumTypeValue,
  ObjectField,
  PrinterOptions,
} from "@proto-graphql/codegen-core";

import { code, joinCode, type Printable } from "../../../codegen/index.js";
import { protoTypeSymbol } from "../util.js";

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
  valueExpr: Printable[],
  field: ObjectField<EnumType>,
  opts: PrinterOptions,
): Printable[] {
  const createBlockStmtCodes = (valueExpr: Printable[]): Printable[][] => {
    const chunks: Printable[][] = [];

    if (field.type.unspecifiedValue != null) {
      const escapeCode =
        field.isNullable() && !field.isList()
          ? code`return null;`
          : code`throw new Error("${field.name} is required field. But got unspecified.");`;
      chunks.push(code`
        if (${valueExpr} === ${protoTypeSymbol(
          field.type.proto,
          opts,
        )}.${enumValueJsName(field.type, field.type.unspecifiedValue, opts)}) {
          ${escapeCode}
        }
      `);
    }
    for (const ev of field.type.valuesWithIgnored) {
      if (!ev.isIgnored()) continue;
      chunks.push(code`
      if (${valueExpr} === ${protoTypeSymbol(
        field.type.proto,
        opts,
      )}.${enumValueJsName(field.type, ev, opts)}) {
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
      ${joinCode(stmts)}
      return item;
    })`;
  }

  return code`
    ${joinCode(createBlockStmtCodes(valueExpr))}
    return ${valueExpr};
  `;
}

function enumValueJsName(
  et: EnumType,
  ev: EnumTypeValue,
  opts: PrinterOptions,
): string {
  switch (opts.protobuf) {
    case "ts-proto":
      return ev.proto.name;
    case "protobuf-es":
      return ev.proto.localName;
  }
}
