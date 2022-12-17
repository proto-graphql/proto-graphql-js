import * as pbjs from "@testapis/node/lib/testapis/edgecases/import_from_same_pkg";
import { queryField } from "nexus";

import { makeTestSchema } from "../../src/makeTestSchema";
import * as childTypes from "../__generated__/nexus/protobufjs/testapis/edgecases/import_from_same_pkg/child_pb_nexus";
import * as parentTypes from "../__generated__/nexus/protobufjs/testapis/edgecases/import_from_same_pkg/parent_pb_nexus";

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
