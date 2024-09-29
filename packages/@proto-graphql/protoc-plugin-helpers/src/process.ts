import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import type { PrinterOptions } from "@proto-graphql/codegen-core";
import { type Options, parseOptions } from "./options";

export function createTsGenerator<DSL extends PrinterOptions["dsl"]>({
  generateFiles,
  dsl,
}: {
  generateFiles: (schema: Schema<Options<DSL>>, file: DescFile) => void;
  dsl: DSL;
}): (schema: Schema<Options<DSL>>) => void {
  return function generateTs(schema: Schema<Partial<Options<DSL>>>) {
    if (schema.options.printer?.dsl == null) {
      Object.assign(schema.options, parseOptions([], dsl));
    }
    for (const file of schema.files) {
      generateFiles(schema as Schema<Options<DSL>>, file);
    }
  };
}
