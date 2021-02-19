import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("enums", "protobufjs", {
  schemaTests: [
    [
      "query",
      {
        extraSchema: `
          import { queryField } from "nexus";
          import * as pbjs from "@testapis/node/lib/testapis/enums";

          export const testQuery = queryField("test", {
            type: "MessageWithEnums",
            resolve() {
              return new pbjs.testapi.enums.MessageWithEnums({
                requiredMyEnum: pbjs.testapi.enums.MyEnum.MY_ENUM_BAR,
                requiredMyEnumWithoutUnspecified:
                  pbjs.testapi.enums.MyEnumWithoutUnspecified.MY_ENUM_WITHOUT_UNSPECIFIED_FOO,
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
          fragment Message on MessageWithEnums {
            requiredMyEnum
            requiredMyEnumWithoutUnspecified
            optionalMyEnum
            optionalMyEnumWithoutUnspecified
          }
        `,
      },
    ],
  ],
});

testSchemaGeneration("enums", "native protobuf");
