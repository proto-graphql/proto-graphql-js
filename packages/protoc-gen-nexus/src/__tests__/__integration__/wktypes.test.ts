import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("wktypes", "protobufjs", {
  extraSchema: `
    import { asNexusMethod } from "nexus";
    import { DateTimeResolver } from "graphql-scalars";
    export const dateTime = asNexusMethod(DateTimeResolver, "dateTime")
  `,
  schemaTests: [
    [
      "values are present",
      {
        extraSchema: `
          import { queryField } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/wktypes";

          export const testQuery = queryField("test", {
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
        `,
        testQuery: `
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
        `,
      },
    ],
    [
      "values are blank",
      {
        extraSchema: `
          import { queryField } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/wktypes";

          export const testQuery = queryField("test", {
            type: "Message",
            resolve() {
              return new pbjs.testapis.wktypes.Message({});
            },
          });
        `,
        testQuery: `
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
        `,
      },
    ],
  ],
});

testSchemaGeneration("wktypes", "native protobuf", {
  extraSchema: `
    import { asNexusMethod } from "nexus";
    import { DateTimeResolver } from "graphql-scalars";
    export const dateTime = asNexusMethod(DateTimeResolver, "dateTime")
  `,
});
