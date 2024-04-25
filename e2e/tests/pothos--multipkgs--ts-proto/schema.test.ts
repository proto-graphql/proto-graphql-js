import { graphql } from "graphql";
import { expect, it } from "vitest";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
      query Test {
        test {
          message {
            body
          }
          enum
        }
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "test": {
          "enum": "BAR",
          "message": {
            "body": "hello",
          },
        },
      },
    }
  `);
});
