import {
  ObjectField,
  ObjectOneofField,
  type PrinterOptions,
  type SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode } from "ts-poet";

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
    { nullable, list }: { nullable: boolean; list: boolean },
  ): Code => {
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
      /* istanbul ignore next */
      default: {
        const _exhaustiveCheck: never = opts.protobuf;
        throw new Error(`Unexpected protobuf: ${_exhaustiveCheck}`);
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
  sourceExpr: Code,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable }: { nullable: boolean },
): Code {
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
}

function createBlockStmtCodeForProtobufEs(
  sourceExpr: Code,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable, list }: { nullable: boolean; list: boolean },
): Code {
  let valueExpr: Code;
  switch (true) {
    case field instanceof ObjectOneofField: {
      valueExpr = code`${sourceExpr}.${tsFieldName(field.proto, opts)}.value`;
      break;
    }
    case field instanceof ObjectField: {
      valueExpr = code`${sourceExpr}${list ? "" : "?"}.${tsFieldName(
        field.type.oneofUnionType.proto,
        opts,
      )}.value`;
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
