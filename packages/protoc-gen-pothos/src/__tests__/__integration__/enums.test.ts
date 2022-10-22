import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("enums", "ts-proto", {
  schemaTests: [
    [
      "query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { MessageWithEnums$Ref } from "./testapis/enums/enums.pb.pothos";
          import { MessageWithEnums, MyEnum, MyEnumWithoutUnspecified } from "@testapis/ts-proto/lib/testapis/enums/enums";

          builder.queryField("test", (f) => f.field({
            type: MessageWithEnums$Ref,
            resolve() {
              return MessageWithEnums.fromPartial({
                requiredMyEnum: MyEnum.MY_ENUM_BAR,
                requiredMyEnumWithoutUnspecified:
                  MyEnumWithoutUnspecified.MY_ENUM_WITHOUT_UNSPECIFIED_FOO,
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
