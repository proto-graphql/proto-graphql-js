import "@proto-nexus/google-protobuf";
import { Message } from "@testapis/node-native/lib/testapis/proto3_optional/proto3_optional_pb";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/proto3_optional/proto3_optional_pb_nexus";

const testQuery = queryField("test1", {
  type: "Message",
  resolve() {
    return new Message();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
