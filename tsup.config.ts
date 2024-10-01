import { defineConfig } from "tsup";

// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default defineConfig({
  entry: [
    "src/index.ts",
    "src/protoc-gen-pothos.ts",
    "src/protoc-gen-nexus.ts",
    "!src/__tests__/**",
    "!src/**/*.test.*",
  ],
  format: ["cjs", "esm"],
  sourcemap: true,
  splitting: false,
  clean: true,
  outDir: "dist",
  onSuccess: "tsc -p . --outDir dist",
});
