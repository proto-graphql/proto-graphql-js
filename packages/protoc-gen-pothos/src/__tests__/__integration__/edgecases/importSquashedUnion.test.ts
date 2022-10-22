import { testSchemaGeneration } from "../../__helpers__/process.test.helper";

testSchemaGeneration(["edgecases/import_squashed_union/pkg1", "edgecases/import_squashed_union/pkg2"], "ts-proto", {
  schemaTests: [
    [
      "tests query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { Message as MessageRef } from "./testapis/edgecases/import_squashed_union/pkg2/types_pb_nexus";
          import { Message } from "@testapis/ts-proto/lib/testapis/edgecases/import_squashed_union/pkg2/types";

          builder.queryField("test", (t) => t.field({
            type: MessageRef,
            resolve() {
              return Message.fromPartial({
                msg: {
                  msg1: { body: "hello" },
                },
              });
            },
          }));
      `,
        testQuery: `
          query Test {
            test {
              msg {
                ... on OneofMessage1 {
                  __typename
                  body
                }
              }
            }
          }
      `,
      },
    ],
  ],
});
