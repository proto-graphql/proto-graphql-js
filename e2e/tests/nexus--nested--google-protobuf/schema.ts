import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { ParentMessage } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/nested/nested_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/nested/nested_pb_nexus";

const testQuery = queryField("test1", {
  type: "ParentMessage",
  resolve() {
    return new ParentMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, testQuery],
});
