import type { Printable } from "./types.js";

export function joinCode(
  _codes: Printable[][],
  _separator?: string,
): Printable[] {
  throw new Error("Not implemented");
}

export function literalOf(_value: unknown): Printable[] {
  throw new Error("Not implemented");
}
