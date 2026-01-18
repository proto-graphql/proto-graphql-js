import type { Printable } from "./types.js";

export function code(
  _strings: TemplateStringsArray,
  ..._values: unknown[]
): Printable[] {
  throw new Error("Not implemented");
}
