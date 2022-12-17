import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test {
          body
          nested {
            nestedBody
          }
          nestedEnum
        }
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "body": "hello",
          "nested": Object {
            "nestedBody": "world",
          },
          "nestedEnum": "BAR",
        },
      },
    }
  `);
});
