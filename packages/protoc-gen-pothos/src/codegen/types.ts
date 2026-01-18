export type {
  ImportSymbol,
  Printable,
} from "@bufbuild/protoplugin";

export { createImportSymbol } from "@bufbuild/protoplugin";

import type { ImportSymbol } from "@bufbuild/protoplugin";

export function isImportSymbol(value: unknown): value is ImportSymbol {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value as Record<string, unknown>).kind === "es_symbol"
  );
}
