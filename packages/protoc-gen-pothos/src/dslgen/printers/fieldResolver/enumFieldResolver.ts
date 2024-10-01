import type { GeneratedFile, Printable } from "@bufbuild/protoplugin";
import {
  type EnumType,
  type EnumTypeValue,
  type ObjectField,
  type PrinterOptions,
  createProtoTypeExpr,
} from "@proto-graphql/codegen-core";

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
export function printEnumResolverStmts(
  g: GeneratedFile,
  valueExpr: Printable,
  field: ObjectField<EnumType>,
  opts: PrinterOptions,
): void {
  const createBlockStmts = (valueExpr: Printable): Printable[] => {
    const lines: Printable[][] = [];

    if (field.type.unspecifiedValue != null) {
      const protoTypeExpr = createProtoTypeExpr(field.type.proto, opts);
      const evName = enumValueJsName(
        field.type,
        field.type.unspecifiedValue,
        opts,
      );

      lines.push(["if (", valueExpr, "===", protoTypeExpr, ".", evName, ") {"]);
      if (field.isNullable() && !field.isList()) {
        lines.push(["return null;"]);
      } else {
        lines.push([
          `throw new Error("${field.name} is required field. But got unspecified.");`,
        ]);
      }
      lines.push(["}"]);
    }

    for (const ev of field.type.valuesWithIgnored) {
      if (!ev.isIgnored()) continue;
      const protoTypeExpr = createProtoTypeExpr(field.type.proto, opts);
      const evName = enumValueJsName(field.type, ev, opts);
      lines.push(["if (", valueExpr, "===", protoTypeExpr, ".", evName, ") {"]);
      lines.push([
        `throw new Error("${ev.name} is ignored in GraphQL schema");`,
      ]);
      lines.push(["}"]);
    }

    return lines;
  };

  if (field.isList()) {
    const lines = createBlockStmts("item");
    if (lines.length === 0) {
      g.print("return ", valueExpr);
      return;
    }
    g.print("return ", valueExpr, ".map(item => {");
    for (const line of lines) {
      g.print(line);
    }
    g.print("return item;");
    g.print("});");
    return;
  }

  for (const line of createBlockStmts(valueExpr)) {
    g.print(line);
  }
  g.print("return ", valueExpr);
  return;
}

function enumValueJsName(
  et: EnumType,
  ev: EnumTypeValue,
  opts: PrinterOptions,
): string {
  switch (opts.protobuf) {
    case "ts-proto":
      return ev.proto.name;
    case "protobuf-es": {
      return ev.proto.localName;
    }
    case "protobufjs":
    case "google-protobuf":
      throw new Error(`Unsupported protobuf: ${opts.protobuf}`);
    default: {
      opts satisfies never;
      throw "unreachable";
    }
  }
}
