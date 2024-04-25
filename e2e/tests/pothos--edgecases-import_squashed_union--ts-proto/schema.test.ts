import { graphql } from "graphql";
import { expect, it } from "vitest";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
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
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "test": {
          "msg": {
            "__typename": "OneofMessage1",
            "body": "hello",
          },
        },
      },
    }
  `);
});
