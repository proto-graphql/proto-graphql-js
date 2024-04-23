import {
  ObjectField,
  ObjectOneofField,
  PrinterOptions,
  SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import { Code, code, joinCode } from "ts-poet";

/**
 * @example nullable
 * ```ts
 * const value = source.v1 ?? source.v2 ?? source.v3;
 * if (value != null) {
 *   throw new Error("...");
 * }
 * return value
 * ```
 */
export function createOneofUnionResolverCode(
  sourceExpr: Code,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
): Code {
  const createBlockStmtCode = (
    sourceExpr: Code,
    { nullable }: { nullable: boolean },
  ): Code => {
    const createFieldExpr = (memberField: ObjectField<any>) => {
      if (field instanceof ObjectOneofField) {
        return code`${sourceExpr}.${tsFieldName(memberField.proto, opts)}`;
      }
      return code`${sourceExpr}?.${tsFieldName(memberField.proto, opts)}`;
    };

    return code`
      const value = ${joinCode(field.type.fields.map(createFieldExpr), {
        on: "??",
      })};
      if (value == null) {
        ${
          nullable
            ? "return null"
            : `throw new Error("${field.name} should not be null")`
        };
      }
      return value;
    `;
  };

  if (field instanceof ObjectField && field.isList()) {
    return code`
      return ${sourceExpr}.map(item => {
        ${createBlockStmtCode(code`item`, { nullable: false })}
      })
    `;
  }

  return createBlockStmtCode(sourceExpr, { nullable: field.isNullable() });
}
