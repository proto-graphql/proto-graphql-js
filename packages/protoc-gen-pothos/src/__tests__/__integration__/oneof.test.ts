import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("oneof", "ts-proto", {
  schemaTests: [
    [
      "tests query",
      {
        extraSchema: `
          import { builder } from "./builder";
          import { OneofParent$Ref } from "./testapis/oneof/oneof.pb.pothos";
          import { OneofParent } from "@testapis/ts-proto/lib/testapis/oneof/oneof";

          builder.queryField("test", (t) => t.field({
            type: OneofParent$Ref,
            resolve() {
              return OneofParent.fromPartial({
                requiredMessage1: {
                  body: "hello",
                },
              });
            },
          }));
      `,
        testQuery: `
          query Test {
            test {
              requiredOneofMembers {
                ... on OneofMemberMessage1 {
                  body
                }
                ... on OneofMemberMessage2 {
                  imageUrl
                }
              }
              optionalOneofMembers {
                ... on OneofMemberMessage1 {
                  body
                }
                ... on OneofMemberMessage2 {
                  imageUrl
                }
              }
            }
          }
      `,
      },
    ],
  ],
});
