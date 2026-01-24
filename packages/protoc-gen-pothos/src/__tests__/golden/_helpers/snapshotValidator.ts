import { join } from "node:path";
import type { GeneratedFile } from "./codeGenerationRunner.js";

const EXPECTED_DIR_NAME = "__expected__";
const TYPE_ERRORS_FILENAME = "type-errors.txt";
const SCHEMA_FILENAME = "schema.graphql";

export interface SnapshotFile {
  content: string;
  expectedPath: string;
}

/**
 * Gets the __expected__ directory path for a test case.
 */
export function getExpectedDirPath(testCaseDir: string): string {
  return join(testCaseDir, EXPECTED_DIR_NAME);
}

/**
 * Gets the expected type-errors.txt path for a test case.
 */
export function getExpectedTypeErrorsPath(testCaseDir: string): string {
  return join(testCaseDir, EXPECTED_DIR_NAME, TYPE_ERRORS_FILENAME);
}

/**
 * Gets the expected schema.graphql path for a test case.
 */
export function getExpectedSchemaPath(testCaseDir: string): string {
  return join(testCaseDir, EXPECTED_DIR_NAME, SCHEMA_FILENAME);
}

/**
 * Collects generated files and maps them to their expected snapshot paths.
 * Each generated file is mapped to the corresponding path under __expected__/.
 *
 * @param testCaseDir - The test case directory path
 * @param generatedFiles - Array of generated files with name and content
 * @returns Array of snapshot files with content and expected paths
 */
export async function collectGeneratedFilesForSnapshot(
  testCaseDir: string,
  generatedFiles: GeneratedFile[]
): Promise<SnapshotFile[]> {
  const expectedDir = getExpectedDirPath(testCaseDir);

  return generatedFiles.map((file) => ({
    content: file.content,
    expectedPath: join(expectedDir, file.name),
  }));
}
