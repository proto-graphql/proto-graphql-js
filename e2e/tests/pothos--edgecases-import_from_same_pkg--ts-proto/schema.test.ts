import { graphql } from "graphql";
import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test {
          child {
            body
          }
        }
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "child": Object {
            "body": "hello",
          },
        },
      },
    }
  `);
});
