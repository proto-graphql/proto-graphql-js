import { describe, expect, it } from "vitest";
import { buildPluginParam, executeGeneration } from "./codeGenerationRunner.js";
import type { TestCase, TestCaseConfig } from "./testCaseDiscovery.js";

function createTestCase(
  overrides: Partial<TestCase> & { config: Partial<TestCaseConfig> },
): TestCase {
  return {
    name: overrides.name ?? "ts-proto/testapis.basic.enums",
    dir: overrides.dir ?? "/path/to/test/case",
    hasQuery: overrides.hasQuery ?? false,
    config: {
      package: overrides.config.package ?? "testapis.basic.enums",
      runtimeVariant: overrides.config.runtimeVariant ?? "ts-proto",
      runtime: overrides.config.runtime ?? "ts-proto",
      param: overrides.config.param,
      builderPath: overrides.config.builderPath ?? "builder.ts",
    },
  };
}

describe("codeGenerationRunner", () => {
  describe("executeGeneration", () => {
    it("should generate files for ts-proto runtime", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0].name).toMatch(/\.pb\.pothos\.ts$/);
      expect(result.files[0].content).toBeTruthy();
    });

    it("should generate files for protobuf-es-v1 runtime", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "protobuf-es-v1",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it("should generate files for protobuf-es runtime", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "protobuf-es",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it("should apply custom param when provided", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "ts-proto",
          param: "partial_inputs",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it("should apply import_prefix param", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "ts-proto",
          param: "import_prefix=@testapis/ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files[0].content).toContain("@testapis/ts-proto");
    });

    it("should generate files with correct content including imports", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.files[0].content).toContain("import");
    });

    it("should generate multiple files for packages with multiple proto files", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.scalars",
          runtime: "ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.error).toBeUndefined();
      expect(result.files.length).toBeGreaterThanOrEqual(1);
    });

    it("should return file paths relative to package", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.basic.enums",
          runtime: "ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.files[0].name).toMatch(/^testapis\/basic\/enums\//);
    });

    it("should fail for non-message oneof members without ignore option", () => {
      const testCase = createTestCase({
        config: {
          package: "testapis.oneof.non_message",
          runtime: "ts-proto",
        },
      });

      const result = executeGeneration(testCase);

      expect(result.files).toHaveLength(0);
      expect(result.error).toBeTruthy();
    });
  });

  describe("buildPluginParam", () => {
    describe("ts-proto runtime", () => {
      it("should include import_prefix, pothos_builder_path, and int64 scalars", () => {
        const testCase = createTestCase({
          config: {
            runtime: "ts-proto",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain(
          "import_prefix=@proto-graphql/e2e-testapis-ts-proto/lib/",
        );
        expect(param).toContain("pothos_builder_path=../builder");
        expect(param).toContain("scalar=int64=String");
      });

      it("should append custom param for ts-proto", () => {
        const testCase = createTestCase({
          config: {
            runtime: "ts-proto",
            param: "partial_inputs",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain(
          "import_prefix=@proto-graphql/e2e-testapis-ts-proto/lib/",
        );
        expect(param).toContain("partial_inputs");
      });
    });

    describe("protobuf-es-v1 runtime", () => {
      it("should include import_prefix, pothos_builder_path, and protobuf_lib=protobuf-es-v1", () => {
        const testCase = createTestCase({
          config: {
            runtime: "protobuf-es-v1",
            runtimeVariant: "protobuf-es-v1",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain(
          "import_prefix=@proto-graphql/e2e-testapis-protobuf-es/lib/",
        );
        expect(param).toContain("pothos_builder_path=../builder");
        expect(param).toContain("protobuf_lib=protobuf-es-v1");
      });

      it("should combine protobuf_lib with custom param", () => {
        const testCase = createTestCase({
          config: {
            runtime: "protobuf-es-v1",
            runtimeVariant: "protobuf-es-v1",
            param: "partial_inputs",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain("protobuf_lib=protobuf-es-v1");
        expect(param).toContain("partial_inputs");
      });
    });

    describe("protobuf-es runtime", () => {
      it("should include import_prefix, pothos_builder_path, and protobuf_lib=protobuf-es", () => {
        const testCase = createTestCase({
          config: {
            runtime: "protobuf-es",
            runtimeVariant: "protobuf-es",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain(
          "import_prefix=@proto-graphql/e2e-testapis-protobuf-es-v2/lib/",
        );
        expect(param).toContain("pothos_builder_path=../builder");
        expect(param).toContain("protobuf_lib=protobuf-es");
      });

      it("should combine protobuf_lib with custom param", () => {
        const testCase = createTestCase({
          config: {
            runtime: "protobuf-es",
            runtimeVariant: "protobuf-es",
            param: "partial_inputs",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain("protobuf_lib=protobuf-es");
        expect(param).toContain("partial_inputs");
      });
    });

    describe("ts-proto-forcelong variant", () => {
      it("should use Int scalars instead of String for 64-bit integers", () => {
        const testCase = createTestCase({
          config: {
            runtime: "ts-proto",
            runtimeVariant: "ts-proto-forcelong",
          },
        });

        const param = buildPluginParam(testCase);

        expect(param).toContain(
          "import_prefix=@proto-graphql/e2e-testapis-ts-proto-with-forcelong-number/lib/",
        );
        expect(param).toContain("scalar=int64=Int");
        expect(param).not.toContain("scalar=int64=String");
      });
    });
  });
});
