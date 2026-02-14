import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { executeGraphQLQuery } from "./graphqlQueryExecutor.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, "../_fixtures/schema-test");

describe("graphqlQueryExecutor", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(
      join(__dirname, "__test_fixtures_query_executor__"),
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("executeGraphQLQuery", () => {
    it("should execute GraphQL query from query.graphql against schema.ts", async () => {
      const result = await executeGraphQLQuery(fixtureDir);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result).toContain('"data"');
      expect(result.result).toContain('"hello": "world"');
    });

    it("should return error when query.graphql does not exist", async () => {
      const schemaContent = `
export const schema = {};
`;
      await writeFile(join(tempDir, "schema.ts"), schemaContent);

      const result = await executeGraphQLQuery(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error when schema.ts does not exist", async () => {
      const queryContent = `query { hello }`;
      await writeFile(join(tempDir, "query.graphql"), queryContent);

      const result = await executeGraphQLQuery(tempDir);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return GraphQL errors in result for invalid query", async () => {
      const schemaContent = `
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => "world",
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
});
`;
      const queryContent = `query { unknownField }`;
      await writeFile(join(tempDir, "schema.ts"), schemaContent);
      await writeFile(join(tempDir, "query.graphql"), queryContent);

      const result = await executeGraphQLQuery(tempDir);

      expect(result.success).toBe(true);
      expect(result.result).toContain('"errors"');
      expect(result.result).toContain(
        '"Cannot query field \\"unknownField\\" on type \\"Query\\"."',
      );
    });

    it("should clean up temporary script after execution", async () => {
      await executeGraphQLQuery(fixtureDir);

      const files = await readdir(fixtureDir);
      const tempScripts = files.filter((f) =>
        f.startsWith("__temp_query_executor"),
      );
      expect(tempScripts).toHaveLength(0);
    });

    it("should clean up temporary script even on failure", async () => {
      const queryContent = `query { hello }`;
      await writeFile(join(tempDir, "query.graphql"), queryContent);

      await executeGraphQLQuery(tempDir);

      const files = await readdir(tempDir);
      const tempScripts = files.filter((f) =>
        f.startsWith("__temp_query_executor"),
      );
      expect(tempScripts).toHaveLength(0);
    });
  });
});
