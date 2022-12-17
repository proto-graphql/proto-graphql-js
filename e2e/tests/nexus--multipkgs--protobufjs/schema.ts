import * as pbjs from "@testapis/node/lib/testapis/multipkgs/subpkg2";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/multipkgs/subpkg1/types_pb_nexus";
import * as types2 from "../__generated__/nexus/protobufjs/testapis/multipkgs/subpkg2/types_pb_nexus";

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
