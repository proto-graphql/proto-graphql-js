import { createEcmaScriptPlugin, type Schema } from "@bufbuild/protoplugin";
import {
  createTsGenerator,
  type Options,
  parsePothosOptions,
} from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { formatCode } from "./codegen/stringify.js";
import { generateFiles } from "./printer.js";

const baseGenerateTs = createTsGenerator({
  generateFiles,
  dsl: "pothos",
});

// `transpile` does not receive the parsed plugin options, so capture the
// `format` flag here when `generateTs` runs (which sees `schema.options`).
// One `plugin.run(req)` is one logical request, and protoplugin invokes
// `generateTs` before `transpile`, so this single-slot state is safe within
// a request.
let formatEnabled = true;

export const protocGenPothos = createEcmaScriptPlugin({
  name: "protoc-gen-pothos",
  version: `v${version}`,
  generateTs: (schema: Schema<Partial<Options<"pothos">>>) => {
    formatEnabled = schema.options.format !== false;
    return baseGenerateTs(schema as Schema<Options<"pothos">>);
  },
  parseOptions: parsePothosOptions,
  // NOTE: force `target=ts` and apply formatting
  transpile: (files) => {
    if (!formatEnabled) return files;
    return files.map((f) => ({
      ...f,
      content: formatCode(f.content),
    }));
  },
});
