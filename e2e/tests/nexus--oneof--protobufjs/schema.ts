import * as pbjs from "@testapis/node/lib/testapis/oneof";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/oneof/oneof_pb_nexus";

const testQuery = queryField("test1", {
  type: "OneofParent",
  resolve() {
    return new pbjs.testapis.oneof.OneofParent({});
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
