import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { executeGeneration } from "./_helpers/codeGenerationRunner.js";
import {
  cleanupGeneratedDir,
  writeGeneratedFiles,
} from "./_helpers/fileWriter.js";
import { executeGraphQLQuery } from "./_helpers/graphqlQueryExecutor.js";
import { buildGraphQLSchema } from "./_helpers/graphqlSchemaFetcher.js";
import {
  collectGeneratedFilesForSnapshot,
  getExpectedQueryResultPath,
  getExpectedSchemaPath,
  getExpectedTypeErrorsPath,
} from "./_helpers/snapshotValidator.js";
import {
  discoverTestCases,
  type TestCase,
} from "./_helpers/testCaseDiscovery.js";
import { runTypeCheck } from "./_helpers/typeScriptChecker.js";

const goldenDir = join(import.meta.dirname, "../../../../../tests/golden");

const testCases = await discoverTestCases(goldenDir);

describe("Golden Tests", () => {
  it("should discover test cases", () => {
    expect(Array.isArray(testCases)).toBe(true);
  });

  describe.each(testCases)("$name", (testCase: TestCase) => {
    beforeAll(async () => {
      await cleanupGeneratedDir(testCase.dir);
      const result = executeGeneration(testCase);
      if (result.error) {
        throw new Error(`Code generation failed: ${result.error}`);
      }
      await writeGeneratedFiles(testCase.dir, result.files);
    });

    it("should generate code that passes type checking", () => {
      const typeCheckResult = runTypeCheck(testCase);
      expect(typeCheckResult.formattedErrors).toBe("");
      expect(typeCheckResult.success).toBe(true);
    });

    it("should match generated file snapshots", async () => {
      const result = executeGeneration(testCase);
      const snapshotFiles = await collectGeneratedFilesForSnapshot(
        testCase.dir,
        result.files,
      );

      for (const snapshotFile of snapshotFiles) {
        await expect(snapshotFile.content).toMatchFileSnapshot(
          snapshotFile.expectedPath,
        );
      }
    });

    it("should match type errors snapshot", async () => {
      const typeCheckResult = runTypeCheck(testCase);
      await expect(typeCheckResult.formattedErrors).toMatchFileSnapshot(
        getExpectedTypeErrorsPath(testCase.dir),
      );
    });

    it("should match GraphQL schema snapshot", async () => {
      const schemaResult = await buildGraphQLSchema(testCase.dir);
      if (!schemaResult.success) {
        throw new Error(
          `Failed to build GraphQL schema: ${schemaResult.error}`,
        );
      }
      await expect(schemaResult.schema).toMatchFileSnapshot(
        getExpectedSchemaPath(testCase.dir),
      );
    });

    if (testCase.hasQuery) {
      it("should match GraphQL query result snapshot", async () => {
        const queryResult = await executeGraphQLQuery(testCase.dir);
        if (!queryResult.success) {
          throw new Error(
            `Failed to execute GraphQL query: ${queryResult.error}`,
          );
        }
        await expect(queryResult.result).toMatchFileSnapshot(
          getExpectedQueryResultPath(testCase.dir),
        );
      });
    }
  });
});
