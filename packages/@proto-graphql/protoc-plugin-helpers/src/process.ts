import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";

import { type Options, parsePothosOptions } from "./options.js";

export function createTsGenerator({
  generateFiles,
}: {
  generateFiles: (schema: Schema<Options<"pothos">>, file: DescFile) => void;
  dsl: "pothos";
}): (schema: Schema<Options<"pothos">>) => void {
  return function generateTs(schema: Schema<Partial<Options<"pothos">>>) {
    if (schema.options.printer?.dsl == null) {
      Object.assign(schema.options, parsePothosOptions([]));
    }
    for (const file of schema.files) {
      generateFiles(schema as Schema<Options<"pothos">>, file);
    }
  };
}
