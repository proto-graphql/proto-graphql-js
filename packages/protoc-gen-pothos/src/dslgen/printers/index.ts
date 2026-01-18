import type { createRegistry } from "@bufbuild/protobuf";
import {
  EnumType,
  InputObjectType,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { type Code, code, imp } from "ts-poet";

import type { Printable } from "../../codegen/index.js";
import { createEnumTypeCode } from "./enumType.js";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import { createObjectTypeCode } from "./objectType.js";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { PothosPrinterOptions } from "./util.js";

function isImportSymbol(
  value: unknown,
): value is { kind: "es_symbol"; name: string; from: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    (value as Record<string, unknown>).kind === "es_symbol"
  );
}

/**
 * ts-poet's imp() cannot correctly parse symbol names containing '$'.
 * We work around this by temporarily replacing '$' with a placeholder,
 * and then replacing it back in the final output.
 */
const DOLLAR_PLACEHOLDER = "__PROTO_GRAPHQL_DOLLAR__";

function escapeDollarForTsPoet(name: string): string {
  return name.replace(/\$/g, DOLLAR_PLACEHOLDER);
}

function unescapeDollarInOutput(output: string): string {
  return output.replace(new RegExp(DOLLAR_PLACEHOLDER, "g"), "$");
}

/**
 * Creates a Code object that restores $ signs when toString() is called.
 */
function createDollarRestoringCode(innerCode: Code): Code {
  const originalToString = innerCode.toString.bind(innerCode);
  const wrappedCode = Object.create(innerCode);
  wrappedCode.toString = (opts?: { path?: string }) => {
    const output = originalToString(opts);
    return unescapeDollarInOutput(output);
  };
  return wrappedCode;
}

/**
 * Temporary bridge function to convert Printable[] to ts-poet Code.
 * This is needed during the migration phase while some printers still use ts-poet.
 */
export function printableToCode(printable: Printable[]): Code {
  // Convert Printable[] to an array that ts-poet can understand
  const parts: (string | Code)[] = [];

  for (const p of printable) {
    if (typeof p === "string") {
      // Normalize whitespace: remove leading/trailing empty lines
      const normalized = normalizeWhitespace(p);
      if (normalized !== "") {
        parts.push(normalized);
      }
    } else if (isImportSymbol(p)) {
      // Convert ImportSymbol to ts-poet import
      // Escape $ in symbol name because ts-poet cannot parse it correctly
      const escapedName = escapeDollarForTsPoet(p.name);
      parts.push(code`${imp(`${escapedName}@${p.from}`)}`);
    } else if (Array.isArray(p)) {
      // Recursively handle nested Printable[]
      parts.push(printableToCode(p as Printable[]));
    }
  }

  // Join all parts into a single Code, with $ sign restoration on toString()
  return createDollarRestoringCode(code`${parts}`);
}

/**
 * Normalize whitespace in template literals:
 * - Remove common leading indentation
 * - Trim leading/trailing empty lines (but preserve inline spaces)
 */
function normalizeWhitespace(str: string): string {
  // Split into lines
  const lines = str.split("\n");

  // Find minimum indentation (ignoring empty lines)
  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const match = line.match(/^(\s*)/);
    if (match) {
      minIndent = Math.min(minIndent, match[1].length);
    }
  }

  if (minIndent === Number.POSITIVE_INFINITY) {
    minIndent = 0;
  }

  // Remove common indentation
  const normalized = lines
    .map((line) => (line.trim() === "" ? "" : line.slice(minIndent)))
    .join("\n");

  // Only trim leading/trailing newlines, not spaces
  const trimStart = normalized.replace(/^\n+/, "");
  const trimEnd = trimStart.replace(/\n+$/, "");
  return trimEnd;
}

export function createTypeDslCodes(
  types: (
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
  )[],
  registry: ReturnType<typeof createRegistry>,
  opts: PothosPrinterOptions,
): Code[] {
  return types.flatMap((type) => {
    if (type instanceof ObjectType) {
      return [printableToCode(createObjectTypeCode(type, registry, opts))];
    }
    if (type instanceof InputObjectType) {
      return [printableToCode(createInputObjectTypeCode(type, registry, opts))];
    }
    if (type instanceof EnumType) {
      return [printableToCode(createEnumTypeCode(type, registry, opts))];
    }
    if (
      type instanceof OneofUnionType ||
      type instanceof SquashedOneofUnionType
    ) {
      return [printableToCode(createOneofUnionTypeCode(type, registry, opts))];
    }

    const _exhaustiveCheck: never = type;
    throw "unreachable";
  });
}
