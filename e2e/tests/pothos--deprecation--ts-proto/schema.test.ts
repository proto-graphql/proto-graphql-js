import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test1 {
          body
        }
        test2 {
          body
        }
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test1": Object {
          "body": "hello",
        },
        "test2": Object {
          "body": "world",
        },
      },
    }
  `);
});
