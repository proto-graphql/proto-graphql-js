import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSyncFn } from "synckit";

// `formatCode` is called from `protocGenPothos.run` (a sync API enforced by
// `@bufbuild/protoplugin`), so we wrap oxfmt's async `format` in a worker
// thread and block via Atomics.wait. The worker is a plain ESM `.mjs` file so
// `new Worker(...)` can load it without a TS loader — tsx's `--import tsx`
// does not propagate into worker_threads on Node 22.
//
// At runtime, this module is bundled into `dist/protoc-gen-pothos.{cjs,js}`
// (built) or runs from `src/codegen/stringify.ts` (vitest / tsx). The worker
// is at `./codegen/stringify-worker.mjs` (built) or `./stringify-worker.mjs`
// (source) relative to this file.

// import.meta.url is available at runtime in both formats tsup emits. The
// package's `module: commonjs` tsconfig (used only for declaration emit)
// rejects the syntax itself, so suppress that single check.
// @ts-ignore - `module: commonjs` (used only for declaration emit) rejects the
// import.meta syntax; the root/vitest tsconfig with `module: esnext` accepts
// it, so @ts-expect-error would itself error there. tsup emits both formats.
const importMetaUrl: string = import.meta.url;
const here = dirname(fileURLToPath(importMetaUrl));
const candidates = [
  resolve(here, "codegen/stringify-worker.mjs"),
  resolve(here, "stringify-worker.mjs"),
];
const workerPath = candidates.find((p) => existsSync(p)) ?? candidates[0];

const syncFormat = createSyncFn<(code: string) => string>(workerPath);

export function formatCode(code: string): string {
  return syncFormat(code);
}
