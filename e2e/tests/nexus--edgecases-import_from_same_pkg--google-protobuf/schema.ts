import { ParentMessage } from "@testapis/node-native/lib/testapis/edgecases/import_from_same_pkg/parent_pb";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as parentTypes from "../__generated__/nexus/google-protobuf/testapis/edgecases/import_from_same_pkg/parent_pb_nexus";
import * as childTypes from "../__generated__/nexus/google-protobuf/testapis/edgecases/import_from_same_pkg/child_pb_nexus";

const testQuery = queryField("test1", {
  type: "ParentMessage",
  resolve() {
    return new ParentMessage();
  },
});

export const schema = makeTestSchema({ rootDir: __dirname, types: [parentTypes, childTypes, testQuery] });
