import "@proto-nexus/google-protobuf";
import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { Message } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/proto3_optional/proto3_optional_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/proto3_optional/proto3_optional_pb_nexus";

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
