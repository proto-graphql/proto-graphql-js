import * as path from "path";
import { makeSchema } from "nexus";

import * as scalars from "./scalars";

import * as deprecationsTypes from "./types/testapis/deprecation";
import * as enumsTypes from "./types/testapis/enums";
import * as extensionsTypes from "./types/testapis/extensions";
import * as fieldBehaviorTyeps from "./types/testapis/field_behavior";
import * as helloTypes from "./types/testapis/hello";
import * as nestedTypes from "./types/testapis/nested";
import * as oneofTypes from "./types/testapis/oneof";
import * as wktypesTypes from "./types/testapis/wktypes";

export const schema = makeSchema({
  types: {
    ...scalars,
    ...deprecationsTypes,
    ...enumsTypes,
    ...extensionsTypes,
    ...fieldBehaviorTyeps,
    ...helloTypes,
    ...nestedTypes,
    ...oneofTypes,
    ...wktypesTypes,
  },
  outputs: {
    schema: path.join(__dirname, "../__generated__/schema.graphql"),
    typegen: path.join(__dirname, "../__generated__/typings.ts"),
  },
});
