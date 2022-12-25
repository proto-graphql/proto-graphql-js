import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { Message } from "@testapis/node-native/lib/testapis/edgecases/import_squashed_union/pkg2/types_pb";
import { queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/edgecases/import_squashed_union/pkg1/types_pb_nexus";
import * as types2 from "./__generated__/schema/testapis/edgecases/import_squashed_union/pkg2/types_pb_nexus";

const testQuery = queryField("test1", {
  type: "Message",
  resolve() {
    return new Message();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [types1, types2, testQuery],
});
