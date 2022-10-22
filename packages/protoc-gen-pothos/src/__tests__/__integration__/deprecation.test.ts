import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("deprecation", "ts-proto", {
  schemaTests: [
    [
      "tests query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { DeprecatedMessage as DeprecatedMessageRef } from "./testapis/deprecation/deprecation.pb.pothos";
          import { DeprecatedFileMessage as DeprecatedFileMessageRef } from "./testapis/deprecation/file_deprecation.pb.pothos";
          import { DeprecatedMessage } from "@testapis/ts-proto/lib/testapis/deprecation/deprecation";
          import { DeprecatedFileMessage } from "@testapis/ts-proto/lib/testapis/deprecation/file_deprecation";

          builder.queryField("test1", (t) => t.field({
            type: DeprecatedMessageRef,
            resolve() {
              return DeprecatedMessage.fromPartial({
                body: "hello",
              });
            },
          }));

          builder.queryField("test2", (t) => t.field({
            type: DeprecatedFileMessageRef,
            resolve() {
              return DeprecatedFileMessage.fromPartial({
                body: "world",
              });
            },
          }));
      `,
        testQuery: `
          query Test {
            test1 {
              body
            }
            test2 {
              body
            }
          }
      `,
      },
    ],
  ],
});
