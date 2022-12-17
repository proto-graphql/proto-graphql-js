import * as pbjs from "@testapis/node/lib/testapis/nested";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/nested/nested_pb_nexus";

const testQuery = queryField("test1", {
  type: "ParentMessage",
  resolve() {
    return new pbjs.testapis.nested.ParentMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
