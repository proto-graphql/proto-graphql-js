import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TestCase, TestCaseConfig } from "./testCaseDiscovery.js";
import {
  formatDiagnostics,
  runTypeCheck,
  type TypeCheckDiagnostic,
  type TypeCheckResult,
} from "./typeScriptChecker.js";

function createTestCase(
  overrides: Partial<TestCase> & { config?: Partial<TestCaseConfig> },
): TestCase {
  return {
    name: overrides.name ?? "ts-proto/testapis.enums",
    dir: overrides.dir ?? "/path/to/test/case",
    config: {
      package: overrides.config?.package ?? "testapis.enums",
      runtimeVariant: overrides.config?.runtimeVariant ?? "ts-proto",
      runtime: overrides.config?.runtime ?? "ts-proto",
      param: overrides.config?.param,
      builderPath: overrides.config?.builderPath ?? "builder.ts",
    },
  };
}

describe("typeScriptChecker", () => {
  const testDir = join(import.meta.dirname, "__test_fixtures_tsc__");

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("runTypeCheck", () => {
    it("should return success when no type errors exist", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.valid");
      await mkdir(caseDir, { recursive: true });

      await writeFile(
        join(caseDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            noEmit: true,
            strict: true,
            module: "ESNext",
            moduleResolution: "bundler",
            target: "ES2022",
          },
          include: ["builder.ts", "schema.ts"],
        }),
      );

      await writeFile(
        join(caseDir, "builder.ts"),
        `export const builder = { test: "valid" };`,
      );

      await writeFile(
        join(caseDir, "schema.ts"),
        `import { builder } from "./builder.js";
export const schema = { builder };`,
      );

      const testCase = createTestCase({
        name: "ts-proto/testapis.valid",
        dir: caseDir,
        config: {
          package: "testapis.valid",
          runtime: "ts-proto",
        },
      });

      const result = runTypeCheck(testCase);

      expect(result.success).toBe(true);
      expect(result.diagnostics).toHaveLength(0);
      expect(result.formattedErrors).toBe("");
    });

    it("should detect type errors in builder.ts", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.invalid");
      await mkdir(caseDir, { recursive: true });

      await writeFile(
        join(caseDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            noEmit: true,
            strict: true,
            module: "ESNext",
            moduleResolution: "bundler",
            target: "ES2022",
          },
          include: ["builder.ts"],
        }),
      );

      await writeFile(join(caseDir, "builder.ts"), `const x: string = 123;`);

      const testCase = createTestCase({
        name: "ts-proto/testapis.invalid",
        dir: caseDir,
        config: {
          package: "testapis.invalid",
          runtime: "ts-proto",
        },
      });

      const result = runTypeCheck(testCase);

      expect(result.success).toBe(false);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics[0].file).toContain("builder.ts");
      expect(result.diagnostics[0].code).toBe(2322);
    });

    it("should detect type errors in schema.ts", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.schema-error");
      await mkdir(caseDir, { recursive: true });

      await writeFile(
        join(caseDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            noEmit: true,
            strict: true,
            module: "ESNext",
            moduleResolution: "bundler",
            target: "ES2022",
          },
          include: ["schema.ts"],
        }),
      );

      await writeFile(
        join(caseDir, "schema.ts"),
        `const y: number = "invalid";`,
      );

      const testCase = createTestCase({
        name: "ts-proto/testapis.schema-error",
        dir: caseDir,
        config: {
          package: "testapis.schema-error",
          runtime: "ts-proto",
        },
      });

      const result = runTypeCheck(testCase);

      expect(result.success).toBe(false);
      expect(result.diagnostics.length).toBeGreaterThan(0);
      expect(result.diagnostics[0].file).toContain("schema.ts");
    });

    it("should include __generated__ directory files in type check", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.generated");
      await mkdir(join(caseDir, "__generated__"), { recursive: true });

      await writeFile(
        join(caseDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            noEmit: true,
            strict: true,
            module: "ESNext",
            moduleResolution: "bundler",
            target: "ES2022",
          },
          include: ["builder.ts", "__generated__/**/*.ts"],
        }),
      );

      await writeFile(
        join(caseDir, "__generated__", "generated.ts"),
        `export const generated: string = 42;`,
      );

      await writeFile(
        join(caseDir, "builder.ts"),
        `import { generated } from "./__generated__/generated.js";
export const builder = { generated };`,
      );

      const testCase = createTestCase({
        name: "ts-proto/testapis.generated",
        dir: caseDir,
        config: {
          package: "testapis.generated",
          runtime: "ts-proto",
        },
      });

      const result = runTypeCheck(testCase);

      expect(result.success).toBe(false);
      expect(
        result.diagnostics.some((d) => d.file.includes("generated.ts")),
      ).toBe(true);
    });

    it("should return diagnostic with line and character position", async () => {
      const caseDir = join(testDir, "ts-proto", "testapis.position");
      await mkdir(caseDir, { recursive: true });

      await writeFile(
        join(caseDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            noEmit: true,
            strict: true,
            module: "ESNext",
            moduleResolution: "bundler",
            target: "ES2022",
          },
          include: ["builder.ts"],
        }),
      );

      await writeFile(
        join(caseDir, "builder.ts"),
        `
const valid = "ok";
const x: string = 123;
`,
      );

      const testCase = createTestCase({
        name: "ts-proto/testapis.position",
        dir: caseDir,
        config: {
          package: "testapis.position",
          runtime: "ts-proto",
        },
      });

      const result = runTypeCheck(testCase);

      expect(result.success).toBe(false);
      expect(result.diagnostics[0].line).toBe(3);
      expect(result.diagnostics[0].character).toBeGreaterThan(0);
    });
  });

  describe("formatDiagnostics", () => {
    it("should format empty diagnostics as empty string", () => {
      const result = formatDiagnostics([], "/test/case");
      expect(result).toBe("");
    });

    it("should format diagnostics in snapshot-friendly format", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "/test/case/builder.ts",
          line: 5,
          character: 10,
          message: "Type 'number' is not assignable to type 'string'.",
          code: 2322,
        },
      ];

      const result = formatDiagnostics(diagnostics, "/test/case");

      expect(result).toContain("builder.ts");
      expect(result).toContain("5");
      expect(result).toContain("10");
      expect(result).toContain("TS2322");
      expect(result).toContain(
        "Type 'number' is not assignable to type 'string'.",
      );
    });

    it("should normalize path separators for cross-platform compatibility", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "/test/case/subfolder/file.ts",
          line: 1,
          character: 1,
          message: "Error",
          code: 1000,
        },
      ];

      const result = formatDiagnostics(diagnostics, "/test/case");

      expect(result).not.toContain("/test/case/");
      expect(result).toContain("subfolder/file.ts");
    });

    it("should use forward slashes even on Windows-style paths", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "C:\\test\\case\\builder.ts",
          line: 1,
          character: 1,
          message: "Error",
          code: 1000,
        },
      ];

      const result = formatDiagnostics(diagnostics, "C:\\test\\case");

      expect(result).not.toContain("\\");
      expect(result).toContain("builder.ts");
    });

    it("should sort diagnostics by file, line, and character", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "/test/case/schema.ts",
          line: 10,
          character: 5,
          message: "Error B",
          code: 1001,
        },
        {
          file: "/test/case/builder.ts",
          line: 5,
          character: 10,
          message: "Error A",
          code: 1000,
        },
        {
          file: "/test/case/builder.ts",
          line: 5,
          character: 5,
          message: "Error C",
          code: 1002,
        },
      ];

      const result = formatDiagnostics(diagnostics, "/test/case");
      const lines = result.split("\n").filter((l) => l.trim());

      expect(lines[0]).toContain("builder.ts(5,5)");
      expect(lines[1]).toContain("builder.ts(5,10)");
      expect(lines[2]).toContain("schema.ts(10,5)");
    });

    it("should format each diagnostic on its own line", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "/test/case/builder.ts",
          line: 1,
          character: 1,
          message: "Error 1",
          code: 1000,
        },
        {
          file: "/test/case/schema.ts",
          line: 2,
          character: 2,
          message: "Error 2",
          code: 1001,
        },
      ];

      const result = formatDiagnostics(diagnostics, "/test/case");
      const lines = result.split("\n").filter((l) => l.trim());

      expect(lines).toHaveLength(2);
    });

    it("should format diagnostic with standard format: file(line,char): error TScode: message", () => {
      const diagnostics: TypeCheckDiagnostic[] = [
        {
          file: "/test/case/builder.ts",
          line: 5,
          character: 10,
          message: "Type 'number' is not assignable to type 'string'.",
          code: 2322,
        },
      ];

      const result = formatDiagnostics(diagnostics, "/test/case");

      expect(result).toBe(
        "builder.ts(5,10): error TS2322: Type 'number' is not assignable to type 'string'.",
      );
    });
  });
});
