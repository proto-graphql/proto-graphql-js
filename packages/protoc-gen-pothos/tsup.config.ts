import { copyFile } from "node:fs/promises";
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
  onSuccess: async () => {
    // tsc emits .d.ts only, so the `.mjs` worker isn't bundled by tsup either.
    // Copy it next to the entry so the runtime resolver finds it.
    await copyFile(
      "src/codegen/stringify-worker.mjs",
      "dist/codegen/stringify-worker.mjs",
    );
    const { spawnSync } = await import("node:child_process");
    const r = spawnSync("tsc", ["-p", ".", "--outDir", "dist"], {
      stdio: "inherit",
      shell: true,
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
  },
});
