import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { type GraphQLSchema, printSchema } from "graphql";

export function printGraphqlSchema({
  rootDir,
  schema,
}: {
  rootDir: string;
  schema: GraphQLSchema;
}) {
  mkdirSync(join(rootDir, "__generated__"), { recursive: true });
  writeFileSync(
    join(rootDir, "__generated__", "schema.graphql"),
    printSchema(schema),
    "utf-8",
  );
}
