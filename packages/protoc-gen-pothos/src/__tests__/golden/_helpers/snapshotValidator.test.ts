import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { GeneratedFile } from "./codeGenerationRunner.js";
import {
  getExpectedDirPath,
  collectGeneratedFilesForSnapshot,
  getExpectedTypeErrorsPath,
  getExpectedSchemaPath,
} from "./snapshotValidator.js";

describe("snapshotValidator", () => {
  const fixturesDir = join(import.meta.dirname, "../_fixtures/snapshot-test");
  const testCaseDir = join(fixturesDir, "test-case");

  beforeEach(async () => {
    await mkdir(testCaseDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(fixturesDir, { recursive: true, force: true });
  });

  describe("getExpectedDirPath", () => {
    it("returns the __expected__ directory path", () => {
      const result = getExpectedDirPath("/path/to/test-case");
      expect(result).toBe("/path/to/test-case/__expected__");
    });
  });

  describe("getExpectedTypeErrorsPath", () => {
    it("returns the type-errors.txt path inside __expected__", () => {
      const result = getExpectedTypeErrorsPath("/path/to/test-case");
      expect(result).toBe("/path/to/test-case/__expected__/type-errors.txt");
    });
  });

  describe("getExpectedSchemaPath", () => {
    it("returns the schema.graphql path inside __expected__", () => {
      const result = getExpectedSchemaPath("/path/to/test-case");
      expect(result).toBe("/path/to/test-case/__expected__/schema.graphql");
    });
  });

  describe("collectGeneratedFilesForSnapshot", () => {
    it("collects generated files with their expected paths", async () => {
      const generatedDir = join(testCaseDir, "__generated__");
      await mkdir(join(generatedDir, "testapis/enums"), { recursive: true });
      await writeFile(
        join(generatedDir, "testapis/enums/enums.pb.pothos.ts"),
        "content1"
      );
      await writeFile(
        join(generatedDir, "testapis/enums/values.pb.pothos.ts"),
        "content2"
      );

      const generatedFiles: GeneratedFile[] = [
        { name: "testapis/enums/enums.pb.pothos.ts", content: "content1" },
        { name: "testapis/enums/values.pb.pothos.ts", content: "content2" },
      ];

      const result = await collectGeneratedFilesForSnapshot(
        testCaseDir,
        generatedFiles
      );

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        content: "content1",
        expectedPath: join(
          testCaseDir,
          "__expected__/testapis/enums/enums.pb.pothos.ts"
        ),
      });
      expect(result).toContainEqual({
        content: "content2",
        expectedPath: join(
          testCaseDir,
          "__expected__/testapis/enums/values.pb.pothos.ts"
        ),
      });
    });

    it("returns empty array when no files provided", async () => {
      const result = await collectGeneratedFilesForSnapshot(testCaseDir, []);
      expect(result).toEqual([]);
    });

    it("handles nested directory structures correctly", async () => {
      const generatedFiles: GeneratedFile[] = [
        {
          name: "testapis/edgecases/import_from_same_pkg/types.pb.pothos.ts",
          content: "nested content",
        },
      ];

      const result = await collectGeneratedFilesForSnapshot(
        testCaseDir,
        generatedFiles
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        content: "nested content",
        expectedPath: join(
          testCaseDir,
          "__expected__/testapis/edgecases/import_from_same_pkg/types.pb.pothos.ts"
        ),
      });
    });
  });
});
