import { readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  cleanupGeneratedDir,
  collectGeneratedFilesForSnapshot,
  executeGeneration,
  getExpectedTypeErrorsPath,
  runTypeCheck,
  writeGeneratedFiles,
} from "@proto-graphql/golden-test-harness";
import { beforeAll, describe, expect, it } from "vitest";
import { protocGenDataloader } from "../../plugin.js";

// Unlike protoc-gen-pothos's `tests/golden/<runtime-variant>/<package>/`
// layout, protoc-gen-dataloader only ever targets protobuf-es v2 (design.md
// §5 has no `protobuf_lib` parameter), so there is no runtime-variant level:
// every immediate subdirectory of `tests/golden-dataloader/` is itself a test
// case named after its testapis package.
const goldenDir = join(
  import.meta.dirname,
  "../../../../../tests/golden-dataloader",
);

const PLUGIN_NAME = "protoc-gen-dataloader";
const PARAM = "import_prefix=@proto-graphql/e2e-testapis-protobuf-es-v2/lib/";

interface TestCase {
  name: string;
  dir: string;
  packageName: string;
}

async function discoverTestCases(dir: string): Promise<TestCase[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort()
    .map((packageName) => ({
      name: packageName,
      dir: join(dir, packageName),
      packageName,
    }));
}

const testCases = await discoverTestCases(goldenDir);

describe("Golden Tests", () => {
  it("should discover test cases", () => {
    expect(testCases.length).toBeGreaterThan(0);
  });

  describe.each(testCases)("$name", (testCase: TestCase) => {
    beforeAll(async () => {
      await cleanupGeneratedDir(testCase.dir);
      const result = executeGeneration({
        plugin: protocGenDataloader,
        package: testCase.packageName,
        param: PARAM,
      });
      if (result.error) {
        throw new Error(`Code generation failed: ${result.error}`);
      }
      await writeGeneratedFiles(testCase.dir, result.files);
    });

    it("should generate code that passes type checking", () => {
      const typeCheckResult = runTypeCheck(testCase.dir);
      expect(typeCheckResult.formattedErrors).toBe("");
      expect(typeCheckResult.success).toBe(true);
    });

    it("should match generated file snapshots", async () => {
      const result = executeGeneration({
        plugin: protocGenDataloader,
        package: testCase.packageName,
        param: PARAM,
      });
      const snapshotFiles = await collectGeneratedFilesForSnapshot(
        testCase.dir,
        result.files,
        { pluginName: PLUGIN_NAME },
      );

      for (const snapshotFile of snapshotFiles) {
        await expect(snapshotFile.content).toMatchFileSnapshot(
          snapshotFile.expectedPath,
        );
      }
    });

    it("should match type errors snapshot", async () => {
      const typeCheckResult = runTypeCheck(testCase.dir);
      await expect(typeCheckResult.formattedErrors).toMatchFileSnapshot(
        getExpectedTypeErrorsPath(testCase.dir),
      );
    });
  });
});
