import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

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
  config: TestCaseConfig;
}

interface GoldenTestConfigJson {
  package?: string;
  runtime?: Runtime;
  additionalParams?: string[];
  prefixMatch?: boolean;
}

interface RuntimeVariantMapping {
  runtime: Runtime;
  param?: string;
}

const runtimeVariantMappings: Record<string, RuntimeVariantMapping> = {
  "ts-proto": { runtime: "ts-proto" },
  "ts-proto-forcelong": { runtime: "ts-proto" },
  "protobuf-es-v1": { runtime: "protobuf-es-v1" },
  "protobuf-es": { runtime: "protobuf-es" },
};

export function resolveConfig(
  runtimeVariant: string,
  packageName: string,
  _caseDir: string
): TestCaseConfig {
  const mapping = runtimeVariantMappings[runtimeVariant];
  if (!mapping) {
    const validVariants = Object.keys(runtimeVariantMappings).join(", ");
    throw new Error(
      `Unknown runtime-variant: "${runtimeVariant}". Valid variants are: ${validVariants}`
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

async function readConfigJson(
  caseDir: string
): Promise<GoldenTestConfigJson | null> {
  try {
    const content = await readFile(join(caseDir, "config.json"), "utf-8");
    return JSON.parse(content) as GoldenTestConfigJson;
  } catch {
    return null;
  }
}

function mergeParams(baseParam: string | undefined, additionalParams: string[] | undefined): string | undefined {
  const allParams: string[] = [];
  if (baseParam) {
    allParams.push(baseParam);
  }
  if (additionalParams && additionalParams.length > 0) {
    allParams.push(...additionalParams);
  }
  return allParams.length > 0 ? allParams.join(",") : undefined;
}

export async function discoverTestCases(goldenDir: string): Promise<TestCase[]> {
  const testCases: TestCase[] = [];

  const runtimeVariantEntries = await readdir(goldenDir, {
    withFileTypes: true,
  });

  for (const runtimeVariantEntry of runtimeVariantEntries) {
    if (!runtimeVariantEntry.isDirectory()) continue;
    if (runtimeVariantEntry.name.startsWith("_")) continue;

    const runtimeVariant = runtimeVariantEntry.name;
    const runtimeVariantDir = join(goldenDir, runtimeVariant);

    if (!runtimeVariantMappings[runtimeVariant]) {
      const validVariants = Object.keys(runtimeVariantMappings).join(", ");
      throw new Error(
        `Unknown runtime-variant: "${runtimeVariant}". Valid variants are: ${validVariants}`
      );
    }

    const packageEntries = await readdir(runtimeVariantDir, {
      withFileTypes: true,
    });

    for (const packageEntry of packageEntries) {
      if (!packageEntry.isDirectory()) continue;
      if (packageEntry.name.startsWith("_")) continue;

      const packageName = packageEntry.name;
      const caseDir = join(runtimeVariantDir, packageName);
      const name = `${runtimeVariant}/${packageName}`;

      const baseConfig = resolveConfig(runtimeVariant, packageName, caseDir);
      const configJson = await readConfigJson(caseDir);

      const config: TestCaseConfig = {
        ...baseConfig,
        param: mergeParams(baseConfig.param, configJson?.additionalParams),
        prefixMatch: configJson?.prefixMatch,
      };

      testCases.push({
        name,
        dir: caseDir,
        config,
      });
    }
  }

  return testCases;
}
