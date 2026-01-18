import {
  ObjectField,
  ObjectOneofField,
  type PrinterOptions,
  type SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import { code, joinCode, type Printable } from "../../../codegen/index.js";

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
  sourceExpr: Printable[],
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
): Printable[] {
  const createBlockStmtCode = (
    sourceExpr: Printable[],
    { nullable, list }: { nullable: boolean; list: boolean },
  ): Printable[] => {
    switch (opts.protobuf) {
      case "ts-proto": {
        return createBlockStmtCodeForTsProto(sourceExpr, field, opts, {
          nullable,
        });
      }
      case "protobuf-es": {
        return createBlockStmtCodeForProtobufEs(sourceExpr, field, opts, {
          nullable,
          list,
        });
      }
    }
  };

  if (field instanceof ObjectField && field.isList()) {
    return code`
      return ${sourceExpr}.map(item => {
        ${createBlockStmtCode(code`item`, { nullable: false, list: true })}
      })
    `;
  }

  return createBlockStmtCode(sourceExpr, {
    nullable: field.isNullable(),
    list: false,
  });
}

function createBlockStmtCodeForTsProto(
  sourceExpr: Printable[],
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable }: { nullable: boolean },
): Printable[] {
  const createFieldExpr = (memberField: ObjectField<any>): Printable[] => {
    if (field instanceof ObjectOneofField) {
      return code`${sourceExpr}.${tsFieldName(memberField.proto, opts).toString()}`;
    }
    return code`${sourceExpr}?.${tsFieldName(memberField.proto, opts).toString()}`;
  };

  return code`
    const value = ${joinCode(field.type.fields.map(createFieldExpr), " ?? ")};
    if (value == null) {
      ${
        nullable
          ? "return null"
          : `throw new Error("${field.name} should not be null")`
      };
    }
    return value;
  `;
}

function createBlockStmtCodeForProtobufEs(
  sourceExpr: Printable[],
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable, list }: { nullable: boolean; list: boolean },
): Printable[] {
  let valueExpr: Printable[];
  switch (true) {
    case field instanceof ObjectOneofField: {
      valueExpr = code`${sourceExpr}.${tsFieldName(field.proto, opts).toString()}.value`;
      break;
    }
    case field instanceof ObjectField: {
      valueExpr = code`${sourceExpr}${list ? "" : "?"}.${tsFieldName(
        field.type.oneofUnionType.proto,
        opts,
      ).toString()}.value`;
      break;
    }
    default: {
      field satisfies never;
      throw "unreachable";
    }
  }
  if (nullable) {
    return code`return ${valueExpr};`;
  }
  return code`
    const value = ${valueExpr};
    if (value == null) {
      throw new Error("${field.name} should not be null");
    }
    return value;
  `;
}
