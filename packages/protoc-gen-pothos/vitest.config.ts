import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default defineConfig({
  test: {
    chaiConfig: {
      truncateThreshold: 0,
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/__tests__/**"],
      reporter: ["text", "json", "html"],
    },
  },
});
