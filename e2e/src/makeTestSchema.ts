import { makeSchema } from "nexus";
import * as path from "path";

export function makeTestSchema({
  rootDir,
  types,
}: {
  rootDir: string;
  types: any;
}) {
  const schema = makeSchema({
    types,
    outputs: {
      schema: path.join(rootDir, "__generated__", "schema.graphql"),
      typegen: path.join(rootDir, "__generated__", "typings.ts"),
    },
    shouldGenerateArtifacts: true,
    features: {
      abstractTypeStrategies: {
        isTypeOf: true,
      },
    },
  });

  return schema;
}
