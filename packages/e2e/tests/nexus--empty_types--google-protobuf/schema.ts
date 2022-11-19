import { EmptyMessage } from "@testapis/node-native/lib/testapis/empty_types/empty_pb";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/empty_types/empty_pb_nexus";

const testQuery = queryField("test1", {
  type: "EmptyMessage",
  resolve() {
    return new EmptyMessage();
  },
});

export const schema = makeTestSchema({ rootDir: __dirname, types: [types1, testQuery] });
