import * as path from "path";
import { makeSchema } from "@nexus/schema";
import * as scalars from "./scalars";
import * as helloTypes from "./types/hello";
import * as wktypesTypes from "./types/wktypes";

export const schema = makeSchema({
  types: { ...scalars, ...helloTypes, ...wktypesTypes },
  outputs: {
    schema: path.join(__dirname, "../__generated__/schema.graphql"),
    typegen: path.join(__dirname, "../__generated__/typings.ts"),
  },
});
