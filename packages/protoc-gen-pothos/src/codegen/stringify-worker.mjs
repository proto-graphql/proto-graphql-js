// Plain ESM worker so `new Worker(...)` can load it without a TS loader.
// (tsx/--import tsx does not propagate to worker_threads on Node 22.)
import { format as oxfmtFormat } from "oxfmt";
import { runAsWorker } from "synckit";

const OPTIONS = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  endOfLine: "lf",
  trailingComma: "all",
  arrowParens: "always",
};

runAsWorker(async (code) => {
  const result = await oxfmtFormat("file.ts", code, OPTIONS);
  const fatal = result.errors.find((e) => e.severity === "Error");
  if (fatal) {
    throw new Error(`oxfmt failed to format: ${fatal.message}`);
  }
  return result.code;
});
