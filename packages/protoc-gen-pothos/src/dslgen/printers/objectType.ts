import type { DescField, Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  InterfaceType,
  type ObjectType,
  createProtoTypeExpr,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import { printFieldDefStmt, printNoopFieldDefStmt } from "./field.js";
import { type PothosPrinterOptions, pothosBuilder, pothosRef } from "./util.js";

/**
 * @example
 * ```ts
 * export const Hello$Ref = builder.objectRef<_$hello$hello_pb.Hello>("Hello")
 * builder.objectType(Hello$Ref, {
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function printObjectTypeCode(
  g: GeneratedFile,
  type: ObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const isInterface = type instanceof InterfaceType;
  const refIdent = pothosRef(type);
  const builderExpr = pothosBuilder(type, opts);
  const protoTypeExpr = createProtoTypeExpr(type.proto, opts);
  const typeNameExpr = g.string(type.typeName);

  g.print("export const ", refIdent, " = ");
  if (isInterface) {
    g.print(builderExpr, ".interfaceRef<Pick<", protoTypeExpr, ",");
    for (const f of type.fields) {
      g.print("  | ", g.string(tsFieldName(f.proto as DescField, opts)));
    }
    g.print(">>(", typeNameExpr, ")");
  } else {
    g.print(builderExpr, ".objectRef<", protoTypeExpr, ">(", typeNameExpr, ")");
  }

  if (isInterface) {
    g.print(builderExpr, ".interfaceType(", refIdent, ", {");
  } else {
    g.print(builderExpr, ".objectType(", refIdent, ", {");
  }

  g.print("  name: ", typeNameExpr, ",");

  g.print("  fields: t => ({");
  for (const f of type.fields) {
    g.print(f.name, ": ");
    printFieldDefStmt(g, f, registry, opts);
    g.print(",");
  }
  if (type.fields.length === 0) {
    g.print("_: ");
    printNoopFieldDefStmt(g, { input: false });
    g.print(",");
  }
  g.print("  }),");

  if (type.description) {
    g.print("  description: ", g.string(type.description), ",");
  }
  if (!isInterface) {
    g.print("  isTypeOf: ");
    printIsTypeOfFuncExpr(g, type, opts);
    g.print(",");
  }

  const extJson = JSON.stringify(protobufGraphQLExtensions(type, registry));
  g.print("  extensions: ", extJson, ",");
  g.print("})");
}

function printIsTypeOfFuncExpr(
  g: GeneratedFile,
  type: ObjectType,
  opts: PothosPrinterOptions,
): void {
  const protoTypeExpr = createProtoTypeExpr(type.proto, opts);
  switch (opts.protobuf) {
    case "ts-proto": {
      g.print("(source) => {");
      g.print(
        "  return (source as ",
        protoTypeExpr,
        " | { $type: string & {} }).$type",
      );
      g.print("    === ", g.string(type.proto.typeName));
      g.print("}");
      return;
    }
    case "protobuf-es": {
      g.print("(source) => {");
      g.print("  return source instanceof ", protoTypeExpr);
      g.print("}");
      return;
    }
    case "google-protobuf":
    case "protobufjs": {
      throw new Error(`Unsupported protobuf lib: ${opts.protobuf}`);
    }
    default: {
      opts satisfies never;
      throw "unreachable";
    }
  }
}
