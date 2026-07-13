import { access } from "node:fs/promises";
import { join } from "node:path";
import {
  discoverGoldenCases,
  mergeParams,
} from "@proto-graphql/golden-test-harness";

export type Runtime = "ts-proto" | "protobuf-es-v1" | "protobuf-es";

export interface TestCaseConfig {
  package: string;
  runtimeVariant: string;
  runtime: Runtime;
  param?: string;
  builderPath: string;
  prefixMatch?: boolean;
}

export interface TestCase {
  name: string;
  dir: string;
  hasQuery: boolean;
  config: TestCaseConfig;
}

interface RuntimeVariantMapping {
  runtime: Runtime;
  param?: string;
}

const runtimeVariantMappings: Record<string, RuntimeVariantMapping> = {
  "ts-proto": { runtime: "ts-proto" },
  "ts-proto-forcelong": { runtime: "ts-proto" },
  "ts-proto-partial-inputs": { runtime: "ts-proto" },
  "protobuf-es-v1": { runtime: "protobuf-es-v1" },
  "protobuf-es": { runtime: "protobuf-es" },
};

export function resolveConfig(
  runtimeVariant: string,
  packageName: string,
  _caseDir: string,
): TestCaseConfig {
  const mapping = runtimeVariantMappings[runtimeVariant];
  if (!mapping) {
    const validVariants = Object.keys(runtimeVariantMappings).join(", ");
    throw new Error(
      `Unknown runtime-variant: "${runtimeVariant}". Valid variants are: ${validVariants}`,
    );
  }

  return {
    package: packageName,
    runtimeVariant,
    runtime: mapping.runtime,
    param: mapping.param,
    builderPath: "builder.ts",
  };
}

async function hasQueryFile(caseDir: string): Promise<boolean> {
  try {
    await access(join(caseDir, "query.graphql"));
    return true;
  } catch {
    return false;
  }
}

export async function discoverTestCases(
  goldenDir: string,
): Promise<TestCase[]> {
  const rawCases = await discoverGoldenCases(goldenDir);

  return Promise.all(
    rawCases.map(
      async ({ name, dir, runtimeVariant, packageName, configJson }) => {
        const baseConfig = resolveConfig(runtimeVariant, packageName, dir);

        const config: TestCaseConfig = {
          ...baseConfig,
          param: mergeParams(baseConfig.param, configJson?.additionalParams),
          prefixMatch: configJson?.prefixMatch,
        };
        const hasQuery = await hasQueryFile(dir);

        return {
          name,
          dir,
          hasQuery,
          config,
        };
      },
    ),
  );
}
