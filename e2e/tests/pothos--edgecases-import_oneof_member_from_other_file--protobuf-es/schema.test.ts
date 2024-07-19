import { graphql } from "graphql";
import { expect, it } from "vitest";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
      query Test {
        test {
          ... on OneofMember1 {
            title
          }
          ... on OneofMember1 {
            count
          }
        }
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "errors": [
        [GraphQLError: Fragment cannot be spread here as objects of type "OneofParent" can never be of type "OneofMember1".],
        [GraphQLError: Cannot query field "title" on type "OneofMember1".],
        [GraphQLError: Fragment cannot be spread here as objects of type "OneofParent" can never be of type "OneofMember1".],
        [GraphQLError: Cannot query field "count" on type "OneofMember1".],
      ],
    }
  `);
});
