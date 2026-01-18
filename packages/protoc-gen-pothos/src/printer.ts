import type { DescFile, Registry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectTypesFromFile,
  createRegistryFromSchema,
  filenameFromProtoFile,
} from "@proto-graphql/codegen-core";
import type { Options } from "@proto-graphql/protoc-plugin-helpers";

import type { Printable } from "./codegen/index.js";
import { createTypeDslPrintables } from "./dslgen/index.js";
import type { PothosPrinterOptions } from "./dslgen/printers/util.js";

const allowedProtobufs = ["ts-proto", "protobuf-es"];

export function generateFiles(
  schema: Schema<Options<"pothos">>,
  file: DescFile,
): void {
  const opts = schema.options;

  if (!allowedProtobufs.includes(opts.printer.protobuf)) {
    opts.printer.protobuf = "ts-proto"; // default
  }

  const registry = createRegistryFromSchema(schema);
  const types = collectTypesFromFile(file, opts.type, schema.allFiles);

  const f = schema.generateFile(filenameFromProtoFile(file, opts.printer));
  const printables = createPrintables(types, registry, opts.printer);

  // ヘッダー出力（preamble プロパティに格納される）
  f.preamble(file);

  if (printables.length === 0) {
    f.print("export {};");
    return;
  }

  // 各型の Printable を直接出力
  for (const p of printables) {
    f.print(...p);
    f.print(); // 空行で区切り
  }
}

function createPrintables(
  types: ReturnType<typeof collectTypesFromFile>,
  registry: Registry,
  opts: PothosPrinterOptions,
): Printable[][] {
  return [...createTypeDslPrintables(types, registry, opts)];
}
