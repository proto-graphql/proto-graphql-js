import { describe, expect, test } from "vitest";
import { code } from "../code-builder.js";
import { joinCode, literalOf } from "../helpers.js";
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

describe("joinCode", () => {
  describe("empty array", () => {
    test("returns empty array for empty input", () => {
      const result = joinCode([]);
      expect(result).toEqual([]);
    });
  });

  describe("single element", () => {
    test("returns the single element without separator", () => {
      const single = code`item`;
      const result = joinCode([single]);
      expect(printableToString(result)).toBe("item");
    });
  });

  describe("multiple elements", () => {
    test("joins with default empty separator", () => {
      const codes = [code`a`, code`b`, code`c`];
      const result = joinCode(codes);
      expect(printableToString(result)).toBe("abc");
    });

    test("joins with comma separator", () => {
      const codes = [code`a`, code`b`, code`c`];
      const result = joinCode(codes, ", ");
      expect(printableToString(result)).toBe("a, b, c");
    });

    test("joins with newline separator", () => {
      const codes = [code`line1`, code`line2`];
      const result = joinCode(codes, "\n");
      expect(printableToString(result)).toBe("line1\nline2");
    });

    test("joins complex code blocks", () => {
      const sym = createImportSymbol("Type", "./type.js");
      const codes = [
        code`const a: ${sym} = 1`,
        code`const b: ${sym} = 2`,
      ];
      const result = joinCode(codes, ";\n");
      expect(printableToString(result)).toBe("const a: Type = 1;\nconst b: Type = 2");
    });
  });
});

describe("literalOf", () => {
  describe("null", () => {
    test("returns null literal", () => {
      const result = literalOf(null);
      expect(printableToString(result)).toBe("null");
    });
  });

  describe("undefined", () => {
    test("returns undefined literal", () => {
      const result = literalOf(undefined);
      expect(printableToString(result)).toBe("undefined");
    });
  });

  describe("string", () => {
    test("returns quoted string", () => {
      const result = literalOf("hello");
      expect(printableToString(result)).toBe('"hello"');
    });

    test("escapes double quotes in string", () => {
      const result = literalOf('say "hello"');
      expect(printableToString(result)).toBe('"say \\"hello\\""');
    });

    test("handles empty string", () => {
      const result = literalOf("");
      expect(printableToString(result)).toBe('""');
    });

    test("escapes backslash in string", () => {
      const result = literalOf("path\\to\\file");
      expect(printableToString(result)).toBe('"path\\\\to\\\\file"');
    });

    test("escapes newline in string", () => {
      const result = literalOf("line1\nline2");
      expect(printableToString(result)).toBe('"line1\\nline2"');
    });
  });

  describe("number", () => {
    test("returns integer literal", () => {
      const result = literalOf(42);
      expect(printableToString(result)).toBe("42");
    });

    test("returns zero literal", () => {
      const result = literalOf(0);
      expect(printableToString(result)).toBe("0");
    });

    test("returns negative number literal", () => {
      const result = literalOf(-10);
      expect(printableToString(result)).toBe("-10");
    });

    test("returns float literal", () => {
      const result = literalOf(3.14);
      expect(printableToString(result)).toBe("3.14");
    });
  });

  describe("boolean", () => {
    test("returns true literal", () => {
      const result = literalOf(true);
      expect(printableToString(result)).toBe("true");
    });

    test("returns false literal", () => {
      const result = literalOf(false);
      expect(printableToString(result)).toBe("false");
    });
  });

  describe("array", () => {
    test("returns empty array literal", () => {
      const result = literalOf([]);
      expect(printableToString(result)).toBe("[]");
    });

    test("returns array with single element", () => {
      const result = literalOf([1]);
      expect(printableToString(result)).toBe("[1]");
    });

    test("returns array with multiple elements", () => {
      const result = literalOf([1, 2, 3]);
      expect(printableToString(result)).toBe("[1, 2, 3]");
    });

    test("returns array with mixed types", () => {
      const result = literalOf([1, "hello", true]);
      expect(printableToString(result)).toBe('[1, "hello", true]');
    });

    test("returns nested array", () => {
      const result = literalOf([[1, 2], [3, 4]]);
      expect(printableToString(result)).toBe("[[1, 2], [3, 4]]");
    });
  });

  describe("object", () => {
    test("returns empty object literal", () => {
      const result = literalOf({});
      expect(printableToString(result)).toBe("{}");
    });

    test("returns object with single property", () => {
      const result = literalOf({ name: "foo" });
      expect(printableToString(result)).toBe('{ name: "foo" }');
    });

    test("returns object with multiple properties", () => {
      const result = literalOf({ name: "foo", value: 42 });
      expect(printableToString(result)).toBe('{ name: "foo", value: 42 }');
    });

    test("returns object with boolean property", () => {
      const result = literalOf({ enabled: true });
      expect(printableToString(result)).toBe("{ enabled: true }");
    });
  });

  describe("nested object", () => {
    test("returns nested object literal", () => {
      const result = literalOf({
        outer: {
          inner: "value",
        },
      });
      expect(printableToString(result)).toBe('{ outer: { inner: "value" } }');
    });

    test("returns deeply nested object literal", () => {
      const result = literalOf({
        level1: {
          level2: {
            level3: "deep",
          },
        },
      });
      expect(printableToString(result)).toBe(
        '{ level1: { level2: { level3: "deep" } } }'
      );
    });

    test("returns object with array property", () => {
      const result = literalOf({
        items: [1, 2, 3],
      });
      expect(printableToString(result)).toBe("{ items: [1, 2, 3] }");
    });
  });

  describe("object containing Printable[]", () => {
    test("embeds Printable[] value directly without stringifying", () => {
      const sym = createImportSymbol("MyType", "./types.js");
      const printableValue = code`${sym}`;
      const result = literalOf({
        type: printableValue,
      });
      expect(printableToString(result)).toBe("{ type: MyType }");
    });

    test("embeds nested Printable[] in object", () => {
      const sym = createImportSymbol("Handler", "./handler.js");
      const handlerCode = code`${sym}.create()`;
      const result = literalOf({
        config: {
          handler: handlerCode,
        },
      });
      expect(printableToString(result)).toBe(
        "{ config: { handler: Handler.create() } }"
      );
    });

    test("handles mixed Printable[] and regular values", () => {
      const sym = createImportSymbol("Type", "./type.js");
      const typeCode = code`${sym}`;
      const result = literalOf({
        name: "test",
        type: typeCode,
        count: 5,
      });
      expect(printableToString(result)).toBe('{ name: "test", type: Type, count: 5 }');
    });

    test("handles array containing Printable[]", () => {
      const sym1 = createImportSymbol("TypeA", "./a.js");
      const sym2 = createImportSymbol("TypeB", "./b.js");
      const result = literalOf({
        types: [code`${sym1}`, code`${sym2}`],
      });
      expect(printableToString(result)).toBe("{ types: [TypeA, TypeB] }");
    });
  });
});
