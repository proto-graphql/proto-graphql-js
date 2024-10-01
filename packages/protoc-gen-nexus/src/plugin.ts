import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import {
  createTsGenerator,
  parseNexusOptions,
} from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { generateFiles } from "./printer.js";

export const protocGenNexus = createEcmaScriptPlugin({
  name: "protoc-gen-nexus",
  version: `v${version}`,
  generateTs: createTsGenerator({
    generateFiles,
    dsl: "nexus",
  }),
  parseOptions: parseNexusOptions,
  // NOTE: force `target=ts`
  transpile: (files) => {
    return files;
  },
});
