import { execFile } from "node:child_process";
import { unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "../../../../");
const tsxPath = join(packageRoot, "node_modules/.bin/tsx");

export interface GraphQLSchemaResult {
  /** Whether the schema was successfully built */
  success: boolean;
  /** The GraphQL schema SDL (on success) */
  schema?: string;
  /** Error message (on failure) */
  error?: string;
}

/**
 * Builds a GraphQL schema SDL from a test case's schema.ts file.
 *
 * Uses tsx in a subprocess to execute schema.ts, which isolates each test case
 * from module caching issues. The schema.ts file must export a `schema` variable
 * that is a GraphQL schema object.
 *
 * @param testCaseDir - The absolute path to the test case directory containing schema.ts
 * @returns The schema SDL on success, or an error message on failure
 */
export async function buildGraphQLSchema(
  testCaseDir: string,
): Promise<GraphQLSchemaResult> {
  const script = `
import { printSchema } from "graphql";
import { schema } from "./schema.js";

if (!schema) {
  throw new Error("schema is not exported or is null/undefined");
}

console.log(printSchema(schema));
`;

  const tempScript = join(testCaseDir, "__temp_schema_builder.ts");

  try {
    await writeFile(tempScript, script);

    const { stdout } = await execFileAsync(tsxPath, [tempScript], {
      cwd: testCaseDir,
      encoding: "utf-8",
    });

    return {
      success: true,
      schema: stdout.trim(),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "stderr" in error &&
            typeof (error as { stderr: unknown }).stderr === "string"
          ? (error as { stderr: string }).stderr
          : String(error);

    return {
      success: false,
      error: message,
    };
  } finally {
    try {
      await unlink(tempScript);
    } catch {
      // Ignore cleanup errors
    }
  }
}
