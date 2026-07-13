import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shape of an optional per-case `config.json`. Plugin-specific consumers decide
 * how to interpret these fields when building their own test case config.
 */
export interface GoldenCaseConfigJson {
  package?: string;
  runtime?: string;
  additionalParams?: string[];
  prefixMatch?: boolean;
}

/**
 * A raw golden test case discovered from the `<runtime-variant>/<package>`
 * directory layout. Plugin-specific discovery maps these into its own richer
 * test case type (runtime resolution, marker files, etc.).
 */
export interface DiscoveredGoldenCase {
  name: string;
  dir: string;
  runtimeVariant: string;
  packageName: string;
  configJson: GoldenCaseConfigJson | null;
}

async function readConfigJson(
  caseDir: string,
): Promise<GoldenCaseConfigJson | null> {
  try {
    const content = await readFile(join(caseDir, "config.json"), "utf-8");
    return JSON.parse(content) as GoldenCaseConfigJson;
  } catch {
    return null;
  }
}

/**
 * Joins a base parameter string with additional params from `config.json` into
 * a single comma-separated plugin parameter string.
 */
export function mergeParams(
  baseParam: string | undefined,
  additionalParams: string[] | undefined,
): string | undefined {
  const allParams: string[] = [];
  if (baseParam) {
    allParams.push(baseParam);
  }
  if (additionalParams && additionalParams.length > 0) {
    allParams.push(...additionalParams);
  }
  return allParams.length > 0 ? allParams.join(",") : undefined;
}

/**
 * Discovers golden test cases from the two-level
 * `<goldenDir>/<runtime-variant>/<package>` layout, skipping `_`-prefixed
 * directories and returning cases in deterministic sorted order.
 *
 * This is intentionally plugin-agnostic: it does not validate runtime variants
 * or read marker files. Consumers resolve those concerns from the returned raw
 * cases, so different plugins can use their own case roots and variant sets.
 */
export async function discoverGoldenCases(
  goldenDir: string,
): Promise<DiscoveredGoldenCase[]> {
  const cases: DiscoveredGoldenCase[] = [];

  const runtimeVariantEntries = (
    await readdir(goldenDir, {
      withFileTypes: true,
    })
  )
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const runtimeVariantEntry of runtimeVariantEntries) {
    const runtimeVariant = runtimeVariantEntry.name;
    const runtimeVariantDir = join(goldenDir, runtimeVariant);

    const packageEntries = (
      await readdir(runtimeVariantDir, {
        withFileTypes: true,
      })
    )
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const packageEntry of packageEntries) {
      const packageName = packageEntry.name;
      const caseDir = join(runtimeVariantDir, packageName);
      const name = `${runtimeVariant}/${packageName}`;
      const configJson = await readConfigJson(caseDir);

      cases.push({
        name,
        dir: caseDir,
        runtimeVariant,
        packageName,
        configJson,
      });
    }
  }

  return cases;
}
