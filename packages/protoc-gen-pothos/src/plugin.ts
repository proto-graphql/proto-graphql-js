import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import {
  createTsGenerator,
  parsePothosOptions,
} from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { formatCode } from "./codegen/stringify.js";
import { generateFiles } from "./printer.js";

export const protocGenPothos = createEcmaScriptPlugin({
  name: "protoc-gen-pothos",
  version: `v${version}`,
  generateTs: createTsGenerator({
    generateFiles,
    dsl: "pothos",
  }),
  parseOptions: parsePothosOptions,
  // NOTE: force `target=ts` and apply formatting
  transpile: (files) => {
    return files.map((f) => ({
      ...f,
      content: formatCode(f.content),
    }));
  },
});
