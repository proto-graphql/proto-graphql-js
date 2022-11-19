import * as pbjs from "@testapis/node/lib/testapis/wktypes";
import { queryField } from "nexus";
import { makeTestSchema } from "../../src/makeTestSchema";
import * as types1 from "../__generated__/nexus/protobufjs/testapis/wktypes/well_known_types_pb_nexus";
import { asNexusMethod } from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import "@proto-nexus/protobufjs";

const test1Query = queryField("test1", {
  type: "Message",
  resolve() {
    return new pbjs.testapis.wktypes.Message({
      timestamp: new pbjs.google.protobuf.Timestamp({
        seconds: 1609137725,
        nanos: 453_000_000,
      }),
      int32Value: new pbjs.google.protobuf.Int32Value({ value: 2 }),
      int64Value: new pbjs.google.protobuf.Int64Value({ value: 4 }),
      uint32Value: new pbjs.google.protobuf.UInt32Value({ value: 5 }),
      uint64Value: new pbjs.google.protobuf.UInt64Value({ value: 6 }),
      floatValue: new pbjs.google.protobuf.FloatValue({ value: 3.5 }),
      doubleValue: new pbjs.google.protobuf.DoubleValue({ value: 2.4 }),
      boolValue: new pbjs.google.protobuf.BoolValue({ value: true }),
      stringValue: new pbjs.google.protobuf.StringValue({ value: "foobar" }),
    });
  },
});

const test2Query = queryField("test2", {
  type: "Message",
  resolve() {
    return new pbjs.testapis.wktypes.Message({});
  },
});

const dateTime = asNexusMethod(DateTimeResolver, "dateTime");

export const schema = makeTestSchema({ rootDir: __dirname, types: [dateTime, types1, test1Query, test2Query] });
