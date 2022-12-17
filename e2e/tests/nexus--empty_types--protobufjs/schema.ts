import * as pbjs from "@testapis/node/lib/testapis/empty_types";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/empty_types/empty_pb_nexus";

const testQuery = queryField("test1", {
  type: "EmptyMessage",
  resolve() {
    return new pbjs.testapis.empty_types.EmptyMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
