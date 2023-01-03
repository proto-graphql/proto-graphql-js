import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbjs from "@proto-graphql/e2e-testapis-protobufjs/lib/testapis/edgecases/import_from_same_pkg";
import { queryField } from "nexus";

import * as childTypes from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/child_pb_nexus";
import * as parentTypes from "./__generated__/schema/testapis/edgecases/import_from_same_pkg/parent_pb_nexus";

const testQuery = queryField("test1", {
  type: "ParentMessage",
  resolve() {
    return new pbjs.testapis.edgecases.import_from_same_pkg.ParentMessage();
  },
});

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [parentTypes, childTypes, testQuery],
});
