import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@testapis/node/lib/testapis/nested";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/nested/nested_pb_nexus";

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
