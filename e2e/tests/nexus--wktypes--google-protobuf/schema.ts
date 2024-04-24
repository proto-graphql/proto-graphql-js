import { makeTestSchema } from "@proto-graphql/e2e-helper";
import { Message } from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/wktypes/well_known_types_pb";
import "@proto-nexus/google-protobuf";
import { ByteResolver, DateTimeResolver } from "graphql-scalars";
import { asNexusMethod, queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/wktypes/well_known_types_pb_nexus";

const testQuery = queryField("test1", {
  type: "Message",
  resolve() {
    return new Message();
  },
});

const byte = asNexusMethod(ByteResolver, "byte");
const dateTime = asNexusMethod(DateTimeResolver, "dateTime");

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [byte, dateTime, types1, testQuery],
});
