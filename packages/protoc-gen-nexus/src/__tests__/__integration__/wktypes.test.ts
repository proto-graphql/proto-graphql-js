import { asNexusMethod, queryField } from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import { testSchemaGeneration } from "../__helpers__/process.test.helper";
import * as pbjs from "@testapis/node/lib/testapis/wktypes";
// import * as pbnative from "@testapis/node-native/lib/testapis/wktypes/wktypes_pb";
import { graphql } from "graphql";

testSchemaGeneration("wktypes", "protobufjs", {
  types: {
    dateTime: asNexusMethod(DateTimeResolver, "dateTime"),
  },
  schemaTests: [
    [
      "values are present",
      {
        test: queryField("test", {
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
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
              query Test {
                test {
                  ...Message
                }
              }
              fragment Message on Message {
                timestamp
                int32Value
                int64Value
                uint32Value
                uint64Value
                floatValue
                doubleValue
                boolValue
                stringValue
              }
            `
          )
        ).toMatchSnapshot();
      },
    ],
    [
      "values are blank",
      {
        test: queryField("test", {
          type: "Message",
          resolve() {
            return new pbjs.testapis.wktypes.Message({});
          },
        }),
      },
      async (schema) => {
        expect(
          await graphql(
            schema,
            `
              query Test {
                test {
                  ...Message
                }
              }
              fragment Message on Message {
                timestamp
                int32Value
                int64Value
                uint32Value
                uint64Value
                floatValue
                doubleValue
                boolValue
                stringValue
              }
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});

testSchemaGeneration("wktypes", "native protobuf", {
  types: {
    dateTime: asNexusMethod(DateTimeResolver, "dateTime"),
  },
});
