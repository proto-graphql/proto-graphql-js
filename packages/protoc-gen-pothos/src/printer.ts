import type { DescFile, Registry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectTypesFromFile,
  createRegistryFromSchema,
  filenameFromProtoFile,
  printCodes,
} from "@proto-graphql/codegen-core";
import type { Options } from "@proto-graphql/protoc-plugin-helpers";
import type { Code } from "ts-poet";

import { createTypeDslCodes } from "./dslgen/index.js";
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
  const code = printCodes(
    createCodes(types, registry, opts.printer),
    "protoc-gen-pothos",
    file,
  );
  f.print(code.trimEnd());
}

function createCodes(
  types: ReturnType<typeof collectTypesFromFile>,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code[] {
  return [...createTypeDslCodes(types, registry, opts)];
}
