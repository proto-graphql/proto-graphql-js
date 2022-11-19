import { mkdirSync, writeFileSync } from "fs";
import { GraphQLSchema, printSchema } from "graphql";
import { join } from "path";

export function printGraphqlSchema({ rootDir, schema }: { rootDir: string; schema: GraphQLSchema }) {
  mkdirSync(join(rootDir, "__generated__"), { recursive: true });
  writeFileSync(join(rootDir, "__generated__", "schema.graphql"), printSchema(schema), "utf-8");
}
