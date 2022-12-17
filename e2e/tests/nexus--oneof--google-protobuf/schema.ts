import { OneofParent } from "@testapis/node-native/lib/testapis/oneof/oneof_pb";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/oneof/oneof_pb_nexus";

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
