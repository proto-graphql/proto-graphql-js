import type { ImportSymbol, Printable } from "./types.js";

export const PRINTABLE_ARRAY_MARKER = Symbol.for(
  "proto-graphql:printable-array",
);

export type PrintableArray = Printable[] & { [PRINTABLE_ARRAY_MARKER]: true };

export function isPrintableArray(value: unknown): value is PrintableArray {
  return Array.isArray(value) && PRINTABLE_ARRAY_MARKER in value;
}

export function markAsPrintableArray(arr: Printable[]): PrintableArray {
  // Direct symbol-key assignment is ~order-of-magnitude faster than
  // `Object.defineProperty` because it avoids a hidden-class transition in
  // V8. Symbol keys do not appear in `for..in` or `Object.keys`, so the
  // observable semantics (used only by `isPrintableArray`) are unchanged.
  // NB: structural-equality matchers like Vitest's `toEqual` *do* compare
  // Symbol-keyed props, so tests that check exact array shape must use the
  // `printableToString` helper or call `isPrintableArray` explicitly.
  (arr as PrintableArray)[PRINTABLE_ARRAY_MARKER] = true;
  return arr as PrintableArray;
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
  // Merge consecutive string-like pieces into a single buffer; only flush the
  // buffer when we hit something protoplugin needs to see as a distinct
  // element (ImportSymbol or a nested non-string Printable). This shrinks the
  // returned array by roughly an order of magnitude for typical printer
  // output, which cuts the downstream `printableToEl` / `elToContent` /
  // `processImports` walks proportionally — without changing any semantics
  // (protoplugin's `f.import(...)` auto-resolution still works because
  // ImportSymbols surface as their own elements).
  const result: Printable[] = [];
  let buf = "";

  function flush(): void {
    if (buf !== "") {
      result.push(buf);
      buf = "";
    }
  }

  for (let i = 0; i < strings.length; i++) {
    buf += strings[i];

    if (i < values.length) {
      const value = values[i];
      if (value == null) {
        buf += String(value);
      } else if (typeof value === "string") {
        buf += value;
      } else if (typeof value === "number") {
        buf += String(value);
      } else if (Array.isArray(value)) {
        // Nested Printable[]: fold string-like elements into buf so they merge
        // with whatever came before/after; only break out for elements
        // protoplugin must handle (ImportSymbol, further nested arrays).
        for (const el of value) {
          if (typeof el === "string") {
            buf += el;
          } else if (typeof el === "number" || typeof el === "boolean") {
            buf += String(el);
          } else {
            flush();
            result.push(el);
          }
        }
      } else {
        // ImportSymbol or another opaque Printable: must remain a distinct
        // element so the protoplugin walker can resolve it.
        flush();
        result.push(value as Printable);
      }
    }
  }

  flush();
  if (result.length === 0) {
    result.push("");
  }

  return markAsPrintableArray(result);
}
