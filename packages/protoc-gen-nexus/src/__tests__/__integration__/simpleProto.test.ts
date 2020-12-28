import { graphql } from "graphql";
import { queryField } from "nexus";
import { testSchemaGeneration } from "../__helpers__/process.test.helper";
import * as pbjs from "@testapis/node/lib/testapis/hello";
import * as pbnative from "@testapis/node-native/lib/testapis/hello/hello_pb";

testSchemaGeneration("hello", "protobufjs", {
  schemaTests: [
    [
      "tests query",
      {
        test: queryField("test", {
          type: "Hello",
          resolve() {
            return new pbjs.testapis.hello.Hello({
              requiredPrimitives: new pbjs.testapis.hello.Primitives({
                requiredDoubleValue: 2.4,
                requiredFloatValue: 3.5,
                requiredInt32Value: 2,
                requiredInt64Value: 4,
                requiredUint32Value: 5,
                requiredUint64Value: 6,
                requiredSint32Value: 7,
                requiredSint64Value: 8,
                requiredFixed32Value: 9,
                requiredFixed64Value: 10,
                requiredSfixed32Value: 11,
                requiredSfixed64Value: 12,
                requiredBoolValue: true,
                requiredStringValue: "foobar",
              }),
              requiredPrimitivesList: [],
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});

testSchemaGeneration("hello", "native protobuf", {
  schemaTests: [
    [
      "tests query",
      {
        test: queryField("test", {
          type: "Hello",
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
            const hello = new pbnative.Hello();
            hello.setRequiredPrimitives(rp);
            return hello;
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
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});
