import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("primitives", "ts-proto", {
  schemaTests: [
    [
      "tests query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { Message as MessageRef } from "./testapis/primitives/primitives_pb_nexus";
          import { Message } from "@testapis/ts-proto/lib/testapis/primitives/primitives";

          builder.queryField("test", (t) => t.field({
            type: MessageRef,
            resolve() {
              return Message.fromPartial({
                requiredPrimitives: {
                  requiredDoubleValue: 2.4,
                  requiredFloatValue: 3.5,
                  requiredInt32Value: 2,
                  requiredInt64Value: "4",
                  requiredUint32Value: 5,
                  requiredUint64Value: "6",
                  requiredSint32Value: 7,
                  requiredSint64Value: "8",
                  requiredFixed32Value: 9,
                  requiredFixed64Value: "10",
                  requiredSfixed32Value: 11,
                  requiredSfixed64Value: "12",
                  requiredBoolValue: true,
                  requiredStringValue: "foobar",
                },
                requiredPrimitivesList: [],
              });
            },
          }));
      `,
        testQuery: `
          query Test {
            test {
              requiredPrimitives {
                ...Primitives
              }
              optionalPrimitives {
                ...Primitives
              }
              requiredPrimitivesList {
                ...Primitives
              }
              optionalPrimitivesList {
                ...Primitives
              }
            }
          }
          fragment Primitives on Primitives {
            requiredDoubleValue
            requiredFloatValue
            requiredInt32Value
            requiredInt64Value
            requiredUint32Value
            requiredUint64Value
            requiredSint32Value
            requiredSint64Value
            requiredFixed32Value
            requiredFixed64Value
            requiredSfixed32Value
            requiredSfixed64Value
            requiredBoolValue
            requiredStringValue
          }
      `,
      },
    ],
  ],
});
