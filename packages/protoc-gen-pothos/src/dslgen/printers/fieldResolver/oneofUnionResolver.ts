import {
  ObjectField,
  ObjectOneofField,
  type ObjectType,
  type PrinterOptions,
  type SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import { code, joinCode, type Printable } from "../../../codegen/index.js";
import { protoTypeSymbol } from "../util.js";

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
      case "protobuf-es-v1":
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
  if (field instanceof ObjectOneofField) {
    valueExpr = code`${sourceExpr}.${tsFieldName(field.proto, opts).toString()}.value`;
  } else if (field instanceof ObjectField) {
    valueExpr = code`${sourceExpr}${list ? "" : "?"}.${tsFieldName(
      field.type.oneofUnionType.proto,
      opts,
    ).toString()}.value`;
  } else {
    field satisfies never;
    throw new Error("unreachable");
  }

  // In protobuf-es, accessing .value on a oneof returns a union of all member types.
  // However, some members may be ignored in the GraphQL Union type,
  // so we need to assert to the expected type containing only non-ignored members.
  const memberTypeSymbols = field.type.fields.map((f) =>
    protoTypeSymbol((f.type as ObjectType).proto, opts),
  );
  const typeAssertion =
    memberTypeSymbols.length > 0
      ? code`${joinCode(
          memberTypeSymbols.map((s) => code`${s}`),
          " | ",
        )} | undefined`
      : code`undefined`;

  if (nullable) {
    return code`return (${valueExpr} ?? null) as ${typeAssertion} | null;`;
  }
  return code`
    const value = ${valueExpr} as ${typeAssertion};
    if (value == null) {
      throw new Error("${field.name} should not be null");
    }
    return value;
  `;
}
