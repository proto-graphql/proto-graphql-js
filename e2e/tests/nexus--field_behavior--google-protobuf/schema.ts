import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { FieldBehaviorComentsMessage } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/field_behavior/comments_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/field_behavior/comments_pb_nexus";

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
