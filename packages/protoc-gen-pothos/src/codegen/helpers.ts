import {
  isPrintableArray,
  markAsPrintableArray,
  type PrintableArray,
} from "./code-builder.js";
import type { Printable } from "./types.js";
import { isImportSymbol } from "./types.js";

export function joinCode(
  codes: Printable[][],
  separator?: string,
): Printable[] {
  if (codes.length === 0) {
    return [];
  }

  const result: Printable[] = [];
  for (let i = 0; i < codes.length; i++) {
    result.push(...codes[i]);
    if (separator !== undefined && i < codes.length - 1) {
      result.push(separator);
    }
  }
  return result;
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Remove nullish values recursively, preserving PrintableArrays.
 * This is a variant of compact() from codegen-core that doesn't lose the PrintableArray marker.
 */
export function compactForCodegen(v: unknown): unknown {
  if (typeof v !== "object") return v;
  if (v == null) return v;
  if (Array.isArray(v)) {
    if (isPrintableArray(v)) {
      return v;
    }
    return v.map(compactForCodegen);
  }
  if ("toCodeString" in v) return v;
  return compactObjForCodegen(v as Record<string, unknown>);
}

function compactObjForCodegen(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v != null) {
      result[key] = compactForCodegen(v);
    }
  }
  return result;
}

export function literalOf(value: unknown): PrintableArray {
  if (value === null) {
    return markAsPrintableArray(["null"]);
  }

  if (value === undefined) {
    return markAsPrintableArray(["undefined"]);
  }

  if (typeof value === "string") {
    return markAsPrintableArray([`"${escapeString(value)}"`]);
  }

  if (typeof value === "number") {
    return markAsPrintableArray([String(value)]);
  }

  if (typeof value === "boolean") {
    return markAsPrintableArray([String(value)]);
  }

  if (Array.isArray(value)) {
    if (isPrintableArray(value)) {
      return value;
    }

    if (value.length === 0) {
      return markAsPrintableArray(["[]"]);
    }

    const elements: Printable[] = ["["];
    for (let i = 0; i < value.length; i++) {
      if (i > 0) {
        elements.push(", ");
      }
      elements.push(...literalOf(value[i]));
    }
    elements.push("]");
    return markAsPrintableArray(elements);
  }

  if (typeof value === "object") {
    // ImportSymbol should be returned as-is (wrapped in PrintableArray)
    if (isImportSymbol(value)) {
      return markAsPrintableArray([value]);
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      return markAsPrintableArray(["{}"]);
    }

    const elements: Printable[] = ["{ "];
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) {
        elements.push(", ");
      }
      const key = keys[i];
      // Always quote keys to match ts-poet literalOf behavior
      elements.push(`"${escapeString(key)}": `);
      elements.push(...literalOf(obj[key]));
    }
    elements.push(" }");
    return markAsPrintableArray(elements);
  }

  return markAsPrintableArray([String(value)]);
}
