import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("wktypes", "ts-proto", {
  builderTs: `
    import SchemaBuilder from "@pothos/core";
    import { GraphQLDateTime } from "graphql-scalars";

    export const builder = new SchemaBuilder<{
      Scalars: {
        DateTime: { Input: Date, Output: Date },
      },
    }>({});
    builder.queryType();
    builder.addScalarType("DateTime", GraphQLDateTime, {});
  `,
  schemaTests: [
    [
      "values are present",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { Message as MessageRef } from "./testapis/wktypes/well_known_types.pb.pothos";
          import { Message } from "@testapis/ts-proto/lib/testapis/wktypes/well_known_types";

          builder.queryField("test", (f) => f.field({
            type: MessageRef,
            resolve() {
              return Message.fromPartial({
                timestamp: new Date(1609137725453),
                int32Value: 2,
                int64Value: "4",
                uint32Value: 5,
                uint64Value: "6",
                floatValue: 3.5,
                doubleValue: 2.4,
                boolValue: true,
                stringValue: "foobar",
              });
            },
          }));
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
          import { builder } from "./builder";
          import { Message as MessageRef } from "./testapis/wktypes/well_known_types.pb.pothos";
          import { Message } from "@testapis/ts-proto/lib/testapis/wktypes/well_known_types";

          builder.queryField("test", (f) => f.field({
            type: MessageRef,
            resolve() {
              return Message.fromPartial({});
            },
          }));
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
