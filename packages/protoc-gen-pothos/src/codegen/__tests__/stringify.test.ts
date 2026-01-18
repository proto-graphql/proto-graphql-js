import { describe, expect, it } from "vitest";
import { formatCode } from "../stringify.js";

describe("formatCode", () => {
  it("formats TypeScript code", () => {
    const input = "const x=1;const y=2;";
    const result = formatCode(input);
    expect(result).toContain("const x = 1;");
    expect(result).toContain("const y = 2;");
  });

  it("applies proper indentation for objects", () => {
    const input =
      "const obj = { aaaa: 1, bbbb: 2, cccc: 3, dddd: 4, eeee: 5, ffff: 6, gggg: 7, hhhh: 8, iiii: 9, jjjj: 10, kkkk: 11, llll: 12, mmmm: 13 };";
    const result = formatCode(input);
    expect(result).toContain("const obj = {");
    expect(result).toMatch(/\n\s+aaaa: 1,/);
  });

  it("breaks long lines", () => {
    const input =
      'builder.objectType(Ref, { "name": "Foo", "fields": t => ({field1: t.expose("field1", { "type": "String" }),field2: t.expose("field2", { "type": "Int" }),}) });';
    const result = formatCode(input);
    expect(result).toMatch(/\n\s+name:/);
    expect(result).toMatch(/\n\s+fields:/);
  });
});
