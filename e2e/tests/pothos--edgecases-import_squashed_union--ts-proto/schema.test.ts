import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
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
    `
  );
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
