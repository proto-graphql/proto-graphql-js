import * as path from "path";
import { makeSchema } from "@nexus/schema";
import * as helloTypes from "./types/hello";
import * as wktypesTypes from "./types/wktypes";

export const schema = makeSchema({
  types: { ...helloTypes, ...wktypesTypes },
  outputs: {
    schema: path.join(__dirname, "../__generated__/schema.graphql"),
    typegen: path.join(__dirname, "../__generated__/typings.ts"),
  },
});
