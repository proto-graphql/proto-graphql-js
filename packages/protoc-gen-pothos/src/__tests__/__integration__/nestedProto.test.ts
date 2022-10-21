import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("nested", "ts-proto", {
  schemaTests: [
    [
      "tests query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { ParentMessage as ParentMessageRef } from "./testapis/nested/nested_pb_nexus";
          import { ParentMessage, ParentMessage_NestedEnum } from "@testapis/ts-proto/lib/testapis/nested/nested";

          builder.queryField("test", (t) => t.field({
            type: ParentMessageRef,
            resolve() {
              return ParentMessage.fromPartial({
                body: "hello",
                nested: {
                  nestedBody: "world",
                },
                nestedEnum: ParentMessage_NestedEnum.BAR
              });
            },
          }));
      `,
        testQuery: `
          query Test {
            test {
              body
              nested {
                nestedBody
              }
              nestedEnum
            }
          }
      `,
      },
    ],
  ],
});
