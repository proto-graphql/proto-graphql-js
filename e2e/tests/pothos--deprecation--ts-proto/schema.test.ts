import { graphql } from "graphql";
import { expect, it } from "vitest";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
      query Test {
        test1 {
          body
        }
        test2 {
          body
        }
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "test1": {
          "body": "hello",
        },
        "test2": {
          "body": "world",
        },
      },
    }
  `);
});
