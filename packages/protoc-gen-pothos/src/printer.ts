import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectTypesFromFile,
  createRegistryFromSchema,
  filenameFromProtoFile,
} from "@proto-graphql/codegen-core";
import type { Options } from "@proto-graphql/protoc-plugin-helpers";

import { createTypeDslPrintables } from "./dslgen/index.js";

const allowedProtobufs = ["ts-proto", "protobuf-es-v1", "protobuf-es"];

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
  const printables = [
    ...createTypeDslPrintables(types, registry, opts.printer),
  ];

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
