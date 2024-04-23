import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { createTsGenerator } from "@proto-graphql/protoc-plugin-helpers";

import { version } from "../package.json";
import { generateFiles } from "./printer";

export const protocGenPothos = createEcmaScriptPlugin({
  name: "protoc-gen-pothos",
  version: `v${version}`,
  generateTs: createTsGenerator({
    generateFiles,
    dsl: "pothos",
  }),
  parseOption: (_key, _value) => {
    // accept any options
  },
  // NOTE: force `target=ts`
  transpile: (files) => {
    return files;
  },
});
