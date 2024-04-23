import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { MessageWithEnums } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/enums/enums_pb";
import { nonNull, queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/enums/enums_pb_nexus";

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
