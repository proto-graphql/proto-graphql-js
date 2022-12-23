import "@proto-nexus/google-protobuf";
import * as pb from "@testapis/node/lib/testapis/proto3_optional";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/proto3_optional/proto3_optional_pb_nexus";

const testQuery = queryField("test1", {
  type: "Message",
  resolve() {
    return new pb.testapis.proto3_optional.Message();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
