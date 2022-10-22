import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration(["multipkgs/subpkg1", "multipkgs/subpkg2"], "ts-proto", {
  schemaTests: [
    [
      "query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { MessageWithSubpkg as MessageWithSubpkgRef } from "./testapis/multipkgs/subpkg2/types.pb.pothos";
          import { SubpkgEnum } from "@testapis/ts-proto/lib/testapis/multipkgs/subpkg1/types";
          import { MessageWithSubpkg } from "@testapis/ts-proto/lib/testapis/multipkgs/subpkg2/types";

          builder.queryField("test", (t) => t.field({
            type: MessageWithSubpkgRef,
            resolve() {
              return MessageWithSubpkg.fromPartial({
                message: {
                  body: "hello",
                },
                enum: SubpkgEnum.BAR
              });
            },
          }));
        `,
        testQuery: `
          query Test {
            test {
              message {
                body
              }
              enum
            }
          }
        `,
      },
    ],
  ],
});
