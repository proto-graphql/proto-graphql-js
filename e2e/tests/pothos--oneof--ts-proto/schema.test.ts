import { graphql } from "graphql";
import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
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
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "optionalOneofMembers": null,
          "requiredOneofMembers": Object {
            "body": "hello",
          },
        },
      },
    }
  `);
});
