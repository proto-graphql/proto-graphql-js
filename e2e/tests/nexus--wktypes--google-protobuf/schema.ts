import "@proto-nexus/google-protobuf";
import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { Message } from "@testapis/node-native/lib/testapis/wktypes/well_known_types_pb";
import { DateTimeResolver } from "graphql-scalars";
import { asNexusMethod, queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/wktypes/well_known_types_pb_nexus";

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
