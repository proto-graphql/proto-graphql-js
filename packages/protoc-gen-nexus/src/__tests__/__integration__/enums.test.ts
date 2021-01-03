import { queryField } from "nexus";
import * as pbjs from "@testapis/node/lib/testapis/enums";
// import * as pbnative from "@testapis/node-native/lib/testapis/wktypes/wktypes_pb";
import { graphql } from "graphql";
import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("enums", "protobufjs", {
  schemaTests: [
    [
      "query",
      {
        test: queryField("test", {
          type: "MessageWithEnums",
          resolve() {
            return new pbjs.testapi.enums.MessageWithEnums({
              requiredMyEnum: pbjs.testapi.enums.MyEnum.MY_ENUM_BAR,
              requiredMyEnumWithoutUnspecified:
                pbjs.testapi.enums.MyEnumWithoutUnspecified.MY_ENUM_WITHOUT_UNSPECIFIED_FOO,
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
              fragment Message on MessageWithEnums {
                requiredMyEnum
                requiredMyEnumWithoutUnspecified
                optionalMyEnum
                optionalMyEnumWithoutUnspecified
              }
            `
          )
        ).toMatchSnapshot();
      },
    ],
  ],
});

testSchemaGeneration("enums", "native protobuf");
