import type { ImportSymbol, Printable } from "./types.js";

export const PRINTABLE_ARRAY_MARKER = Symbol.for(
  "proto-graphql:printable-array",
);

export type PrintableArray = Printable[] & { [PRINTABLE_ARRAY_MARKER]: true };

export function isPrintableArray(value: unknown): value is PrintableArray {
  return Array.isArray(value) && PRINTABLE_ARRAY_MARKER in value;
}

type CodeValue =
  | string
  | number
  | ImportSymbol
  | Printable[]
  | null
  | undefined;

export function code(
  strings: TemplateStringsArray,
  ...values: CodeValue[]
): PrintableArray {
  const result: Printable[] = [];

  for (let i = 0; i < strings.length; i++) {
    if (strings[i] !== "") {
      result.push(strings[i]);
    }

    if (i < values.length) {
      const value = values[i];
      if (value == null) {
        result.push(String(value));
      } else if (typeof value === "string") {
        if (value !== "") {
          result.push(value);
        }
      } else if (typeof value === "number") {
        result.push(String(value));
      } else if (Array.isArray(value)) {
        result.push(...value);
      } else {
        result.push(value as Printable);
      }
    }
  }

  if (result.length === 0) {
    result.push("");
  }

  Object.defineProperty(result, PRINTABLE_ARRAY_MARKER, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return result as PrintableArray;
}
