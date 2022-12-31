import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { EmptyMessage } from "@testapis/node-native/lib/testapis/empty_types/empty_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/empty_types/empty_pb_nexus";

const testQuery = queryField("test1", {
  type: "EmptyMessage",
  resolve() {
    return new EmptyMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
