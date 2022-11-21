import { MessageWithSubpkg } from "@testapis/node-native/lib/testapis/multipkgs/subpkg2/types_pb";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/multipkgs/subpkg1/types_pb_nexus";
import * as types2 from "../__generated__/nexus/google-protobuf/testapis/multipkgs/subpkg2/types_pb_nexus";

const testQuery = queryField("test1", {
  type: "MessageWithSubpkg",
  resolve() {
    return new MessageWithSubpkg();
  },
});

export const schema = makeTestSchema({ rootDir: __dirname, types: [types1, types2, testQuery] });
