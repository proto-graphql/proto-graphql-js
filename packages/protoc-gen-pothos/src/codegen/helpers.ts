import { isPrintableArray } from "./code-builder.js";
import type { Printable } from "./types.js";

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

export function literalOf(value: unknown): Printable[] {
  if (value === null) {
    return ["null"];
  }

  if (value === undefined) {
    return ["undefined"];
  }

  if (typeof value === "string") {
    return [`"${escapeString(value)}"`];
  }

  if (typeof value === "number") {
    return [String(value)];
  }

  if (typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    if (isPrintableArray(value)) {
      return value;
    }

    if (value.length === 0) {
      return ["[]"];
    }

    const elements: Printable[] = ["["];
    for (let i = 0; i < value.length; i++) {
      if (i > 0) {
        elements.push(", ");
      }
      elements.push(...literalOf(value[i]));
    }
    elements.push("]");
    return elements;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      return ["{}"];
    }

    const elements: Printable[] = ["{ "];
    for (let i = 0; i < keys.length; i++) {
      if (i > 0) {
        elements.push(", ");
      }
      const key = keys[i];
      elements.push(`${key}: `);
      elements.push(...literalOf(obj[key]));
    }
    elements.push(" }");
    return elements;
  }

  return [String(value)];
}
