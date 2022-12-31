import * as path from "path";
import { makeSchema } from "nexus";
export function makeTestSchema({ rootDir, types, }) {
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
