import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@proto-graphql/e2e-testapis-protobufjs/lib/testapis/empty_types";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/empty_types/empty_pb_nexus";

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
