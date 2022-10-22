import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("field_behavior", "ts-proto", {
  schemaTests: [
    [
      "query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { FieldBehaviorComentsMessage$Ref } from "./testapis/field_behavior/comments.pb.pothos";
          import { FieldBehaviorComentsMessage } from "@testapis/ts-proto/lib/testapis/field_behavior/comments";

          builder.queryField("test", (t) => t.field({
            type: FieldBehaviorComentsMessage$Ref,
            resolve() {
              return FieldBehaviorComentsMessage.fromPartial({
                requiredField: { body: "hello" },
              });
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              requiredField {
                body
              }
              outputOnlyField {
                body
              }
            }
          }
        `,
      },
    ],
  ],
});
