import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import type { PrinterOptions, TypeOptions } from "@proto-graphql/codegen-core";

import { parseParams } from "./parseParams.js";

export function createTsGenerator<DSL extends PrinterOptions["dsl"]>({
  generateFiles,
  dsl,
}: {
  generateFiles: (
    schema: Schema,
    file: DescFile,
    opts: {
      type: TypeOptions;
      printer: Extract<PrinterOptions, { dsl: DSL }>;
    },
  ) => void;
  dsl: DSL;
}): (schema: Schema) => void {
  return function generateTs(schema: Schema) {
    const params = parseParams(schema.proto.parameter, dsl);
    for (const file of schema.files) {
      generateFiles(schema, file, params);
    }
  };
}
