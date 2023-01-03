import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { DeprecatedMessage } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/deprecation/deprecation_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/deprecation/deprecation_pb_nexus";
import * as types2 from "./__generated__/schema/testapis/deprecation/file_deprecation_pb_nexus";

const testQuery = queryField("test1", {
  type: "DeprecatedMessage",
  resolve() {
    return new DeprecatedMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, types2, testQuery],
});
