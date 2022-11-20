import * as pbjs from "@testapis/node/lib/testapis/field_behavior";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/field_behavior/comments_pb_nexus";

const testQuery = queryField("test1", {
  type: "FieldBehaviorComentsMessage",
  resolve() {
    return new pbjs.testapis.deprecation.FieldBehaviorComentsMessage();
  },
});

export const schema = makeTestSchema({ rootDir: __dirname, types: [types1, testQuery] });
