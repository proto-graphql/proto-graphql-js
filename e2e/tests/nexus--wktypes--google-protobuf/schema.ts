import "@proto-nexus/google-protobuf";
import { Message } from "@testapis/node-native/lib/testapis/wktypes/well_known_types_pb";
import { DateTimeResolver } from "graphql-scalars";
import { asNexusMethod, queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/google-protobuf/testapis/wktypes/well_known_types_pb_nexus";

const testQuery = queryField("test1", {
  type: "Message",
  resolve() {
    return new Message();
  },
});

const dateTime = asNexusMethod(DateTimeResolver, "dateTime");

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [dateTime, types1, testQuery],
});
