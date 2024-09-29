import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import {
  createTsGenerator,
  parsePothosOptions,
} from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { generateFiles } from "./printer.js";

export const protocGenPothos = createEcmaScriptPlugin({
  name: "protoc-gen-pothos",
  version: `v${version}`,
  generateTs: createTsGenerator({
    generateFiles,
    dsl: "pothos",
  }),
  parseOptions: parsePothosOptions,
  // NOTE: force `target=ts`
  transpile: (files) => {
    return files;
  },
});
