import { mkdtemp, rm, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildGraphQLSchema } from "./graphqlSchemaFetcher.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, "../_fixtures/schema-test");

describe("graphqlSchemaFetcher", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "graphql-schema-fetcher-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("buildGraphQLSchema", () => {
    it("should fetch GraphQL schema SDL from schema.ts", async () => {
      const result = await buildGraphQLSchema(fixtureDir);

      expect(result.success).toBe(true);
      expect(result.schema).toContain("type Query");
      expect(result.schema).toContain("hello: String");
    });

    it("should return error when schema.ts does not exist", async () => {
      const result = await buildGraphQLSchema(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error when schema.ts has syntax error", async () => {
      const schemaContent = `
export const schema = {
  this is not valid javascript
};
`;
      await writeFile(join(tempDir, "schema.ts"), schemaContent);

      const result = await buildGraphQLSchema(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error when schema.ts does not export schema", async () => {
      const schemaContent = `
export const notSchema = "something";
`;
      await writeFile(join(tempDir, "schema.ts"), schemaContent);

      const result = await buildGraphQLSchema(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should clean up temporary script after execution", async () => {
      await buildGraphQLSchema(fixtureDir);

      const files = await readdir(fixtureDir);
      const tempScripts = files.filter((f) =>
        f.startsWith("__temp_schema_builder")
      );
      expect(tempScripts).toHaveLength(0);
    });

    it("should clean up temporary script even on failure", async () => {
      const schemaContent = `
export const schema = null;
`;
      await writeFile(join(tempDir, "schema.ts"), schemaContent);

      await buildGraphQLSchema(tempDir);

      const files = await readdir(tempDir);
      const tempScripts = files.filter((f) =>
        f.startsWith("__temp_schema_builder")
      );
      expect(tempScripts).toHaveLength(0);
    });
  });
});
