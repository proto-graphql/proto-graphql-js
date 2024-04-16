import { makeTestSchema } from "@proto-graphql/e2e-helper";
import * as pbnative from "@proto-graphql/e2e-testapis-google-protobuf/lib/testapis/primitives/primitives_pb";
import { ByteResolver } from "graphql-scalars";
import { asNexusMethod, queryField } from "nexus";

import * as types1 from "./__generated__/schema/testapis/primitives/primitives_pb_nexus";

export const testQuery = queryField("test", {
  type: "Message",
  resolve() {
    const rp = new pbnative.Primitives();
    rp.setRequiredDoubleValue(2.4);
    rp.setRequiredFloatValue(3.5);
    rp.setRequiredInt32Value(2);
    rp.setRequiredInt64Value(4);
    rp.setRequiredUint32Value(5);
    rp.setRequiredUint64Value(6);
    rp.setRequiredSint32Value(7);
    rp.setRequiredSint64Value(8);
    rp.setRequiredFixed32Value(9);
    rp.setRequiredFixed64Value(10);
    rp.setRequiredSfixed32Value(11);
    rp.setRequiredSfixed64Value(12);
    rp.setRequiredBoolValue(true);
    rp.setRequiredStringValue("foobar");
    const primitives = new pbnative.Message();
    primitives.setRequiredPrimitives(rp);
    return primitives;
  },
});

const byte = asNexusMethod(ByteResolver, "byte");

export const schema = makeTestSchema({
  rootDir: __dirname,
  types: [byte, types1, testQuery],
});
