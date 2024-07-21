import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default defineConfig({
  resolve: {
    alias: {
      "graphql/language/printer": "graphql/language/printer.js",
      "graphql/language": "graphql/language/index.js",
      graphql: "graphql/index.js",
    },
  },
});
