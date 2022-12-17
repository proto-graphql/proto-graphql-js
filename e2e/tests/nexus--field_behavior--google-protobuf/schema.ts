import { FieldBehaviorComentsMessage } from "@testapis/node-native/lib/testapis/field_behavior/comments_pb";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/field_behavior/comments_pb_nexus";

const testQuery = queryField("test1", {
  type: "FieldBehaviorComentsMessage",
  resolve() {
    return new FieldBehaviorComentsMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
