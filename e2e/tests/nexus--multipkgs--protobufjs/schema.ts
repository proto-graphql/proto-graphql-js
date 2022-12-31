import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@testapis/node/lib/testapis/multipkgs/subpkg2";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/multipkgs/subpkg1/types_pb_nexus";
import * as types2 from "./__generated__/schema/testapis/multipkgs/subpkg2/types_pb_nexus";

const testQuery = queryField("test1", {
  type: "MessageWithSubpkg",
  resolve() {
    return new pbjs.testapis.multipkgs.subpkg1.MessageWithSubpkg();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, types2, testQuery],
});
