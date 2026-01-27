import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  discoverTestCases,
  resolveConfig,
  type TestCase,
} from "./testCaseDiscovery.js";

describe("testCaseDiscovery", () => {
  const testDir = join(import.meta.dirname, "__test_fixtures__");

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("discoverTestCases", () => {
    it("should discover test cases from runtime-variant/package structure", async () => {
      await mkdir(join(testDir, "ts-proto", "testapis.enums"), {
        recursive: true,
      });
      await mkdir(join(testDir, "ts-proto", "testapis.primitives"), {
        recursive: true,
      });

      const testCases = await discoverTestCases(testDir);

      expect(testCases).toHaveLength(2);
      expect(testCases.map((tc) => tc.name).sort()).toEqual([
        "ts-proto/testapis.enums",
        "ts-proto/testapis.primitives",
      ]);
    });

    it("should discover test cases from multiple runtime-variants", async () => {
      await mkdir(join(testDir, "ts-proto", "testapis.enums"), {
        recursive: true,
      });
      await mkdir(join(testDir, "protobuf-es-v1", "testapis.enums"), {
        recursive: true,
      });
      await mkdir(join(testDir, "protobuf-es", "testapis.enums"), {
        recursive: true,
      });

      const testCases = await discoverTestCases(testDir);

      expect(testCases).toHaveLength(3);
      expect(testCases.map((tc) => tc.config.runtime).sort()).toEqual([
        "protobuf-es",
        "protobuf-es-v1",
        "ts-proto",
      ]);
    });

    it("should exclude directories with _ prefix", async () => {
      await mkdir(join(testDir, "ts-proto", "testapis.enums"), {
        recursive: true,
      });
      await mkdir(join(testDir, "ts-proto", "_disabled"), { recursive: true });
      await mkdir(join(testDir, "_internal", "testapis.enums"), {
        recursive: true,
      });

      const testCases = await discoverTestCases(testDir);

      expect(testCases).toHaveLength(1);
      expect(testCases[0].name).toBe("ts-proto/testapis.enums");
    });

    it("should return absolute directory path for each test case", async () => {
      await mkdir(join(testDir, "ts-proto", "testapis.enums"), {
        recursive: true,
      });

      const testCases = await discoverTestCases(testDir);

      expect(testCases[0].dir).toBe(
        join(testDir, "ts-proto", "testapis.enums"),
      );
    });

    it("should return empty array when no test cases exist", async () => {
      const testCases = await discoverTestCases(testDir);

      expect(testCases).toEqual([]);
    });

    it("should handle edgecases package names with dots", async () => {
      await mkdir(
        join(testDir, "ts-proto", "testapis.edgecases.import_from_same_pkg"),
        { recursive: true },
      );

      const testCases = await discoverTestCases(testDir);

      expect(testCases).toHaveLength(1);
      expect(testCases[0].config.package).toBe(
        "testapis.edgecases.import_from_same_pkg",
      );
    });

    it("should throw error for unknown runtime-variant", async () => {
      await mkdir(join(testDir, "unknown-runtime", "testapis.enums"), {
        recursive: true,
      });

      await expect(discoverTestCases(testDir)).rejects.toThrow(
        /unknown runtime-variant/i,
      );
    });
  });

  describe("resolveConfig", () => {
    describe("runtime-variant to base runtime mapping", () => {
      it("should map ts-proto to ts-proto runtime", () => {
        const config = resolveConfig("ts-proto", "testapis.enums", testDir);
        expect(config.runtime).toBe("ts-proto");
        expect(config.runtimeVariant).toBe("ts-proto");
        expect(config.param).toBeUndefined();
      });

      it("should map ts-proto-forcelong to ts-proto runtime without param", () => {
        const config = resolveConfig(
          "ts-proto-forcelong",
          "testapis.primitives",
          testDir,
        );
        expect(config.runtime).toBe("ts-proto");
        expect(config.runtimeVariant).toBe("ts-proto-forcelong");
        expect(config.param).toBeUndefined();
      });

      it("should map protobuf-es-v1 to protobuf-es-v1 runtime", () => {
        const config = resolveConfig(
          "protobuf-es-v1",
          "testapis.enums",
          testDir,
        );
        expect(config.runtime).toBe("protobuf-es-v1");
        expect(config.runtimeVariant).toBe("protobuf-es-v1");
        expect(config.param).toBeUndefined();
      });

      it("should map protobuf-es to protobuf-es runtime", () => {
        const config = resolveConfig("protobuf-es", "testapis.enums", testDir);
        expect(config.runtime).toBe("protobuf-es");
        expect(config.runtimeVariant).toBe("protobuf-es");
        expect(config.param).toBeUndefined();
      });

      it("should throw error for unknown runtime-variant", () => {
        expect(() =>
          resolveConfig("unknown-runtime", "testapis.enums", testDir),
        ).toThrow(/unknown runtime-variant/i);
      });
    });

    describe("package name extraction", () => {
      it("should extract package name from directory name directly", () => {
        const config = resolveConfig("ts-proto", "testapis.enums", testDir);
        expect(config.package).toBe("testapis.enums");
      });

      it("should handle edgecases package names with underscores", () => {
        const config = resolveConfig(
          "ts-proto",
          "testapis.edgecases.import_from_same_pkg",
          testDir,
        );
        expect(config.package).toBe("testapis.edgecases.import_from_same_pkg");
      });
    });

    describe("builderPath generation", () => {
      it("should generate builderPath as relative path", () => {
        const config = resolveConfig("ts-proto", "testapis.enums", testDir);
        expect(config.builderPath).toBe("builder.ts");
      });
    });
  });

  describe("config.json merging", () => {
    it("should merge additionalParams from config.json", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.enums");
      await mkdir(caseDir, { recursive: true });
      await writeFile(
        join(caseDir, "config.json"),
        JSON.stringify({ additionalParams: ["import_prefix=@/proto"] }),
      );

      const testCases = await discoverTestCases(testDir);

      expect(testCases[0].config.param).toBe("import_prefix=@/proto");
    });

    it("should combine config.json additionalParams for ts-proto-forcelong", async () => {
      const caseDir = join(
        testDir,
        "ts-proto-forcelong",
        "testapis.primitives",
      );
      await mkdir(caseDir, { recursive: true });
      await writeFile(
        join(caseDir, "config.json"),
        JSON.stringify({ additionalParams: ["import_prefix=@/proto"] }),
      );

      const testCases = await discoverTestCases(testDir);

      expect(testCases[0].config.param).toBe("import_prefix=@/proto");
    });

    it("should work without config.json", async () => {
      await mkdir(join(testDir, "ts-proto", "testapis.enums"), {
        recursive: true,
      });

      const testCases = await discoverTestCases(testDir);

      expect(testCases[0].config.param).toBeUndefined();
    });
  });
});
