import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("empty_types", "ts-proto", {
  schemaTests: [
    [
      "empty",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { EmptyMessage as EmptyMessageRef } from "./testapis/empty_types/empty_pb_nexus";
          import { EmptyMessage } from "@testapis/ts-proto/lib/testapis/empty_types/empty";

          builder.queryField("test", (t) => t.field({
            type: EmptyMessageRef,
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
