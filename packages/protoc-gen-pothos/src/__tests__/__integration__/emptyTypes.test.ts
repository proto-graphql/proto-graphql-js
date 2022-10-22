import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("empty_types", "ts-proto", {
  schemaTests: [
    [
      "empty",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { EmptyMessage$Ref } from "./testapis/empty_types/empty.pb.pothos";
          import { EmptyMessage } from "@testapis/ts-proto/lib/testapis/empty_types/empty";

          builder.queryField("test", (t) => t.field({
            type: EmptyMessage$Ref,
            resolve() {
              return EmptyMessage.fromPartial({});
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              _
            }
          }
        `,
      },
    ],
  ],
});
