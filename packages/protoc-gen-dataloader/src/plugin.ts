import { createEcmaScriptPlugin, type Schema } from "@bufbuild/protoplugin";
import {
  type DataloaderOptions,
  parseDataloaderOptions,
} from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { formatCode } from "./format.js";
import { generateFiles } from "./printer.js";

// `transpile` does not receive the parsed plugin options, so capture the
// `format` flag here when `generateTs` runs (which sees `schema.options`).
// One `plugin.run(req)` is one logical request, and protoplugin invokes
// `generateTs` before `transpile`, so this single-slot state is safe within
// a request.
let formatEnabled = true;

export const protocGenDataloader = createEcmaScriptPlugin({
  name: "protoc-gen-dataloader",
  version: `v${version}`,
  generateTs: (schema: Schema<Partial<DataloaderOptions>>) => {
    // `parseDataloaderOptions` always runs (even with zero plugin
    // parameters, protoplugin invokes it with an empty array), so
    // `schema.options` is fully populated by the time `generateTs` runs.
    const opts = schema.options as DataloaderOptions;
    formatEnabled = opts.format !== false;

    // Collect diagnostics across every file in the request before failing,
    // so a single `buf generate` run reports every invalid `batch`
    // declaration at once instead of one file at a time (design.md §4.2).
    const errors: string[] = [];
    for (const file of schema.files) {
      errors.push(
        ...generateFiles(schema as Schema<DataloaderOptions>, file, opts),
      );
    }
    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }
  },
  parseOptions: parseDataloaderOptions,
  // NOTE: force `target=ts` and apply formatting
  transpile: (files) => {
    if (!formatEnabled) return files;
    return files.map((f) => ({
      ...f,
      content: formatCode(f.content),
    }));
  },
});
