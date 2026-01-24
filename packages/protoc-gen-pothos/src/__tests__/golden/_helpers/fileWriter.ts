import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { GeneratedFile } from "./codeGenerationRunner.js";

const GENERATED_DIR_NAME = "__generated__";

export function getGeneratedDirPath(testCaseDir: string): string {
  return join(testCaseDir, GENERATED_DIR_NAME);
}

export async function cleanupGeneratedDir(testCaseDir: string): Promise<void> {
  const generatedDir = getGeneratedDirPath(testCaseDir);
  await rm(generatedDir, { recursive: true, force: true });
}

export async function writeGeneratedFiles(
  testCaseDir: string,
  files: GeneratedFile[]
): Promise<void> {
  const generatedDir = getGeneratedDirPath(testCaseDir);

  await mkdir(generatedDir, { recursive: true });

  for (const file of files) {
    const filePath = join(generatedDir, file.name);
    const fileDir = dirname(filePath);

    await mkdir(fileDir, { recursive: true });
    await writeFile(filePath, file.content, "utf-8");
  }
}
