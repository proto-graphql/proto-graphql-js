import type { GeneratedFile, Printable } from "@bufbuild/protoplugin";
import {
  ObjectField,
  ObjectOneofField,
  type PrinterOptions,
  type SquashedOneofUnionType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

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
export function printOneofUnionResolverStmts(
  g: GeneratedFile,
  sourceExpr: Printable,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
) {
  const printBlockStmtCode = (
    sourceExpr: Printable,
    { nullable, list }: { nullable: boolean; list: boolean },
  ) => {
    switch (opts.protobuf) {
      case "ts-proto": {
        printBlockStmtCodeForTsProto(g, sourceExpr, field, opts, {
          nullable,
        });
        return;
      }
      case "protobuf-es": {
        printBlockStmtCodeForProtobufEs(g, sourceExpr, field, opts, {
          nullable,
          list,
        });
        return;
      }
      case "google-protobuf":
      case "protobufjs": {
        throw new Error(`Unsupported protobuf: ${opts.protobuf}`);
      }
      default: {
        opts satisfies never;
        throw "unreachable";
      }
    }
  };

  if (field instanceof ObjectField && field.isList()) {
    g.print("return ", sourceExpr, ".map(item => {");
    printBlockStmtCode("item", { nullable: false, list: true });
    g.print("})");
    return;
  }

  printBlockStmtCode(sourceExpr, {
    nullable: field.isNullable(),
    list: false,
  });
}

function printBlockStmtCodeForTsProto(
  g: GeneratedFile,
  sourceExpr: Printable,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable }: { nullable: boolean },
) {
  g.print("const value = ");

  for (let i = 0; i < field.type.fields.length; i++) {
    if (i > 0) g.print(" ??");
    g.print(
      sourceExpr,
      field instanceof ObjectOneofField ? "." : "?.",
      tsFieldName(field.type.fields[i].proto, opts),
    );
  }
  g.print("if (value == null) {");
  if (nullable) {
    g.print("return null");
  } else {
    g.print(`throw new Error("${field.name} should not be null")`);
  }
  g.print("}");
  g.print("return value");
}

function printBlockStmtCodeForProtobufEs(
  g: GeneratedFile,
  sourceExpr: Printable,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: PrinterOptions,
  { nullable, list }: { nullable: boolean; list: boolean },
) {
  g.print("const value = ");

  switch (true) {
    case field instanceof ObjectOneofField: {
      g.print(sourceExpr, ".", tsFieldName(field.proto, opts), ".value");
      break;
    }
    case field instanceof ObjectField: {
      g.print(
        sourceExpr,
        list ? "." : "?.",
        tsFieldName(field.proto, opts),
        ".value",
      );
      break;
    }
    default: {
      field satisfies never;
      throw "unreachable";
    }
  }
  if (!nullable) {
    g.print("if (value == null) {");
    g.print(`throw new Error("${field.name} should not be null")`);
    g.print("}");
  }
  g.print("return value");
}
