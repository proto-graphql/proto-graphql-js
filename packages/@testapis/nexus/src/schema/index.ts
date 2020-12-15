import * as path from "path";
import { makeSchema } from "@nexus/schema";

import * as scalars from "./scalars";

import * as enumsTypes from "./types/enums";
import * as helloTypes from "./types/hello";
import * as nestedTypes from "./types/nested";
import * as wktypesTypes from "./types/wktypes";

export const schema = makeSchema({
  types: {
    ...scalars,
    ...enumsTypes,
    ...helloTypes,
    ...nestedTypes,
    ...wktypesTypes,
  },
  outputs: {
    schema: path.join(__dirname, "../__generated__/schema.graphql"),
    typegen: path.join(__dirname, "../__generated__/typings.ts"),
  },
});
