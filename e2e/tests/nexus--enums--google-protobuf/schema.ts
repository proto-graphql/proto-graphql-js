import { MessageWithEnums } from "@testapis/node-native/lib/testapis/enums/enums_pb";
import { queryField, nonNull } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/enums/enums_pb_nexus";

const testQuery = queryField("test", {
  type: nonNull("MessageWithEnums"),
  resolve() {
    return new MessageWithEnums();
  },
});
export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
