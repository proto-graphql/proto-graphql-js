import { graphql } from "graphql";
import { expect, it } from "vitest";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
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
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "test": {
          "optionalOneofMembers": null,
          "requiredOneofMembers": {
            "body": "hello",
          },
        },
      },
    }
  `);
});
