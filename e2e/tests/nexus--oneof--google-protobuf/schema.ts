import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { OneofParent } from "@testapis/node-native/lib/testapis/oneof/oneof_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/oneof/oneof_pb_nexus";

const testQuery = queryField("test1", {
  type: "OneofParent",
  resolve() {
    return new OneofParent();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
