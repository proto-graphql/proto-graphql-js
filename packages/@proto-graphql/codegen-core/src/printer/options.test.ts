import { describe, expect, test } from "vitest";
import { protobufLibs } from "./options.js";

describe("protobufLibs", () => {
  test("includes ts-proto", () => {
    expect(protobufLibs).toContain("ts-proto");
  });

  test("includes protobuf-es-v1", () => {
    expect(protobufLibs).toContain("protobuf-es-v1");
  });

  test("includes protobuf-es", () => {
    expect(protobufLibs).toContain("protobuf-es");
  });

  test("has exactly 3 elements", () => {
    expect(protobufLibs).toHaveLength(3);
  });
});
