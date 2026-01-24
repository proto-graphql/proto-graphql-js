import { join } from "node:path";
import ts from "typescript";
import type { TestCase } from "./testCaseDiscovery.js";

export interface TypeCheckDiagnostic {
  file: string;
  line: number;
  character: number;
  message: string;
  code: number;
}

export interface TypeCheckResult {
  success: boolean;
  diagnostics: TypeCheckDiagnostic[];
  formattedErrors: string;
}

export function runTypeCheck(testCase: TestCase): TypeCheckResult {
  const configPath = join(testCase.dir, "tsconfig.json");

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    const message = ts.flattenDiagnosticMessageText(
      configFile.error.messageText,
      "\n",
    );
    return {
      success: false,
      diagnostics: [
        {
          file: configPath,
          line: 1,
          character: 1,
          message,
          code: configFile.error.code,
        },
      ],
      formattedErrors: `tsconfig.json(1,1): error TS${configFile.error.code}: ${message}`,
    };
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    testCase.dir,
  );

  if (parsedConfig.errors.length > 0) {
    const diagnostics = parsedConfig.errors.map((d) => ({
      file: configPath,
      line: 1,
      character: 1,
      message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
      code: d.code,
    }));
    return {
      success: false,
      diagnostics,
      formattedErrors: formatDiagnostics(diagnostics, testCase.dir),
    };
  }

  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
  });

  const allDiagnostics = ts.getPreEmitDiagnostics(program);

  const diagnostics: TypeCheckDiagnostic[] = allDiagnostics.map((d) => {
    const file = d.file;
    if (file && d.start !== undefined) {
      const { line, character } = file.getLineAndCharacterOfPosition(d.start);
      return {
        file: file.fileName,
        line: line + 1,
        character: character + 1,
        message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        code: d.code,
      };
    }
    return {
      file: "",
      line: 0,
      character: 0,
      message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
      code: d.code,
    };
  });

  return {
    success: diagnostics.length === 0,
    diagnostics,
    formattedErrors: formatDiagnostics(diagnostics, testCase.dir),
  };
}

export function formatDiagnostics(
  diagnostics: TypeCheckDiagnostic[],
  baseDir: string,
): string {
  if (diagnostics.length === 0) {
    return "";
  }

  const normalizedBaseDir = normalizePathSeparators(baseDir);

  const sorted = [...diagnostics].sort((a, b) => {
    const fileCompare = a.file.localeCompare(b.file);
    if (fileCompare !== 0) return fileCompare;

    const lineCompare = a.line - b.line;
    if (lineCompare !== 0) return lineCompare;

    return a.character - b.character;
  });

  return sorted
    .map((d) => {
      const normalizedFile = normalizePathSeparators(d.file);
      const relativePath = normalizedFile.startsWith(normalizedBaseDir)
        ? normalizedFile.slice(normalizedBaseDir.length + 1)
        : normalizedFile;

      return `${relativePath}(${d.line},${d.character}): error TS${d.code}: ${d.message}`;
    })
    .join("\n");
}

function normalizePathSeparators(path: string): string {
  return path.replace(/\\/g, "/");
}
