import { execFile } from "node:child_process";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GraphQLQueryExecutionResult {
  /** Whether the query was successfully executed */
  success: boolean;
  /** The GraphQL query execution result JSON (on success) */
  result?: string;
  /** Error message (on failure) */
  error?: string;
}

/**
 * Executes a GraphQL query from a test case's query.graphql against schema.ts.
 *
 * Uses tsx in a subprocess to execute schema.ts, which isolates
 * each test case from module caching issues.
 *
 * @param testCaseDir - The absolute path to the test case directory containing schema.ts and query.graphql
 * @returns The GraphQL query execution result as JSON on success, or an error message on failure
 */
export async function executeGraphQLQuery(
  testCaseDir: string,
): Promise<GraphQLQueryExecutionResult> {
  const script = `
import { readFile } from "node:fs/promises";
import { graphql } from "graphql";
import { schema } from "./schema.js";

async function main() {
  if (!schema) {
    throw new Error("schema is not exported or is null/undefined");
  }

  const rawQuery = await readFile(new URL("./query.graphql", import.meta.url), "utf-8");
  const query = normalizeQuery(rawQuery);

  if (typeof query !== "string" || query.trim().length === 0) {
    throw new Error("query.graphql is empty");
  }

  const result = await graphql({
    schema,
    source: query,
  });

  console.log(JSON.stringify(result, null, 2));
}

function normalizeQuery(raw: string): string {
  const query = raw.replace(/^\\uFEFF/, "").replace(/\\r\\n/g, "\\n");
  const lines = query.split("\\n");

  let minIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }
    const leading = line.match(/^\\s*/) ?? [""];
    minIndent = Math.min(minIndent, leading[0].length);
  }

  if (!Number.isFinite(minIndent) || minIndent === 0) {
    return query;
  }

  return lines.map((line) => line.slice(minIndent)).join("\\n");
}

void main();
`;

  const tempScript = join(testCaseDir, "__temp_query_executor.ts");

  try {
    await writeFile(tempScript, script);

    const { stdout } = await execFileAsync(
      process.execPath,
      ["--import", "tsx", tempScript],
      {
        cwd: testCaseDir,
        encoding: "utf-8",
      },
    );

    return {
      success: true,
      result: stdout.trim(),
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
