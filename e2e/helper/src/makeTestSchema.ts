import * as path from "node:path";

import { makeSchema } from "nexus";

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
      schema: false,
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
