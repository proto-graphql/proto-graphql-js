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
    Object {
      "data": Object {
        "test": Object {
          "msg": Object {
            "__typename": "OneofMessage1",
            "body": "hello",
          },
        },
      },
    }
  `);
});
