import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { ParentMessage } from "@testapis/node-native/lib/testapis/edgecases/import_from_same_pkg/parent_pb";
import { queryField } from "nexus";

import * as childTypes from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/child_pb_nexus";
import * as parentTypes from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/parent_pb_nexus";

const testQuery = queryField("test1", {
  type: "ParentMessage",
  resolve() {
    return new ParentMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [parentTypes, childTypes, testQuery],
});
