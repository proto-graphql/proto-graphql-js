import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { GeneratedFile } from "./codeGenerationRunner.js";
import {
  cleanupGeneratedDir,
  getGeneratedDirPath,
  writeGeneratedFiles,
} from "./fileWriter.js";

describe("fileWriter", () => {
  const testDir = join(import.meta.dirname, "__test_fixtures_writer__");
  const generatedDir = join(testDir, "__generated__");

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("getGeneratedDirPath", () => {
    it("should return __generated__ directory path", () => {
      const result = getGeneratedDirPath(testDir);

      expect(result).toBe(join(testDir, "__generated__"));
    });
  });

  describe("cleanupGeneratedDir", () => {
    it("should delete __generated__ directory if it exists", async () => {
      await mkdir(generatedDir, { recursive: true });
      await writeFile(join(generatedDir, "test.ts"), "content");

      await cleanupGeneratedDir(testDir);

      const exists = await readdir(testDir).then(
        (entries) => entries.includes("__generated__"),
        () => false,
      );
      expect(exists).toBe(false);
    });

    it("should not throw if __generated__ directory does not exist", async () => {
      await expect(cleanupGeneratedDir(testDir)).resolves.not.toThrow();
    });

    it("should delete nested directories", async () => {
      await mkdir(join(generatedDir, "testapis", "enums"), { recursive: true });
      await writeFile(
        join(generatedDir, "testapis", "enums", "enums.pb.pothos.ts"),
        "content",
      );

      await cleanupGeneratedDir(testDir);

      const exists = await readdir(testDir).then(
        (entries) => entries.includes("__generated__"),
        () => false,
      );
      expect(exists).toBe(false);
    });
  });

  describe("writeGeneratedFiles", () => {
    it("should write generated files to __generated__ directory", async () => {
      const files: GeneratedFile[] = [
        {
          name: "testapis/enums/enums.pb.pothos.ts",
          content: "// generated content",
        },
      ];

      await writeGeneratedFiles(testDir, files);

      const content = await readFile(
        join(generatedDir, "testapis/enums/enums.pb.pothos.ts"),
        "utf-8",
      );
      expect(content).toBe("// generated content");
    });

    it("should create nested directories based on file path", async () => {
      const files: GeneratedFile[] = [
        {
          name: "testapis/edgecases/import_from_same_pkg/file.pb.pothos.ts",
          content: "content",
        },
      ];

      await writeGeneratedFiles(testDir, files);

      const entries = await readdir(
        join(generatedDir, "testapis", "edgecases", "import_from_same_pkg"),
      );
      expect(entries).toContain("file.pb.pothos.ts");
    });

    it("should write multiple files", async () => {
      const files: GeneratedFile[] = [
        {
          name: "testapis/enums/enums.pb.pothos.ts",
          content: "content1",
        },
        {
          name: "testapis/enums/other.pb.pothos.ts",
          content: "content2",
        },
      ];

      await writeGeneratedFiles(testDir, files);

      const entries = await readdir(join(generatedDir, "testapis", "enums"));
      expect(entries).toContain("enums.pb.pothos.ts");
      expect(entries).toContain("other.pb.pothos.ts");
    });

    it("should handle empty file list", async () => {
      await writeGeneratedFiles(testDir, []);

      const exists = await readdir(generatedDir).then(
        () => true,
        () => false,
      );
      expect(exists).toBe(true);
    });

    it("should overwrite existing files", async () => {
      await mkdir(join(generatedDir, "testapis", "enums"), { recursive: true });
      await writeFile(
        join(generatedDir, "testapis/enums/enums.pb.pothos.ts"),
        "old content",
      );

      const files: GeneratedFile[] = [
        {
          name: "testapis/enums/enums.pb.pothos.ts",
          content: "new content",
        },
      ];

      await writeGeneratedFiles(testDir, files);

      const content = await readFile(
        join(generatedDir, "testapis/enums/enums.pb.pothos.ts"),
        "utf-8",
      );
      expect(content).toBe("new content");
    });
  });
});
