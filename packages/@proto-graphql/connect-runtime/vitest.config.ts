import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default defineConfig({
  test: {
    chaiConfig: {
      truncateThreshold: 0,
    },
  },
});
