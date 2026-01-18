import { describe, expect, test } from "vitest";
import { code } from "../code-builder.js";
import { createImportSymbol } from "../types.js";

function printableToString(printable: unknown[]): string {
  return printable
    .map((p) => {
      if (typeof p === "string") return p;
      if (typeof p === "number") return String(p);
      if (Array.isArray(p)) return printableToString(p);
      if (typeof p === "object" && p !== null && "kind" in p && p.kind === "es_symbol") {
        return (p as { name: string }).name;
      }
      return String(p);
    })
    .join("");
}

describe("code template tag", () => {
  describe("basic usage", () => {
    test("returns empty array for empty template", () => {
      const result = code``;
      expect(result).toEqual([""]);
    });

    test("returns string content for template without interpolation", () => {
      const result = code`const x = 1`;
      expect(result).toEqual(["const x = 1"]);
    });
  });

  describe("string interpolation", () => {
    test("embeds string value", () => {
      const name = "foo";
      const result = code`const ${name} = 1`;
      expect(printableToString(result)).toBe("const foo = 1");
    });

    test("embeds multiple string values", () => {
      const name = "foo";
      const value = "bar";
      const result = code`const ${name} = "${value}"`;
      expect(printableToString(result)).toBe('const foo = "bar"');
    });
  });

  describe("number interpolation", () => {
    test("embeds number value", () => {
      const num = 42;
      const result = code`const x = ${num}`;
      expect(printableToString(result)).toBe("const x = 42");
    });

    test("embeds zero", () => {
      const result = code`const x = ${0}`;
      expect(printableToString(result)).toBe("const x = 0");
    });
  });

  describe("Printable[] interpolation", () => {
    test("embeds nested Printable array", () => {
      const inner = code`inner`;
      const result = code`outer(${inner})`;
      expect(printableToString(result)).toBe("outer(inner)");
    });

    test("embeds deeply nested Printable array", () => {
      const innermost = code`deep`;
      const inner = code`middle(${innermost})`;
      const result = code`outer(${inner})`;
      expect(printableToString(result)).toBe("outer(middle(deep))");
    });
  });

  describe("ImportSymbol interpolation", () => {
    test("embeds ImportSymbol", () => {
      const sym = createImportSymbol("MyType", "./types.js");
      const result = code`const x: ${sym} = {}`;
      expect(printableToString(result)).toBe("const x: MyType = {}");
    });

    test("embeds multiple ImportSymbols", () => {
      const sym1 = createImportSymbol("TypeA", "./a.js");
      const sym2 = createImportSymbol("TypeB", "./b.js");
      const result = code`type Combined = ${sym1} & ${sym2}`;
      expect(printableToString(result)).toBe("type Combined = TypeA & TypeB");
    });
  });

  describe("multiple interpolation types", () => {
    test("mixes string, number, and ImportSymbol", () => {
      const name = "count";
      const value = 10;
      const sym = createImportSymbol("Counter", "./counter.js");
      const result = code`const ${name}: ${sym} = ${value}`;
      expect(printableToString(result)).toBe("const count: Counter = 10");
    });
  });

  describe("multiline templates", () => {
    test("preserves newlines", () => {
      const result = code`
        const x = 1;
        const y = 2;
      `;
      expect(result[0]).toContain("\n");
    });

    test("handles interpolation across lines", () => {
      const name = "foo";
      const value = "bar";
      const result = code`
        const ${name} = "${value}";
      `;
      expect(printableToString(result)).toContain("const foo");
      expect(printableToString(result)).toContain('"bar"');
    });
  });

  describe("special characters", () => {
    test("handles identifier with $ character", () => {
      const result = code`const MyType$Ref = {}`;
      expect(printableToString(result)).toBe("const MyType$Ref = {}");
    });

    test("handles interpolated identifier with $ character", () => {
      const name = "MyType$Ref";
      const result = code`const ${name} = {}`;
      expect(printableToString(result)).toBe("const MyType$Ref = {}");
    });

    test("handles template literal with backticks in string", () => {
      const str = "hello";
      const result = code`const x = "${str}"`;
      expect(printableToString(result)).toBe('const x = "hello"');
    });
  });

  describe("edge cases", () => {
    test("handles empty string interpolation", () => {
      const empty = "";
      const result = code`prefix${empty}suffix`;
      expect(printableToString(result)).toBe("prefixsuffix");
    });

    test("handles undefined as string in result", () => {
      const undef = undefined;
      const result = code`value: ${undef}`;
      expect(printableToString(result)).toContain("value:");
    });

    test("handles null as string in result", () => {
      const nul = null;
      const result = code`value: ${nul}`;
      expect(printableToString(result)).toContain("value:");
    });
  });
});
