import { graphql } from "graphql";
import { schema } from "./schema";

it("processes a query with squashed union successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test {
          squashedMessage {
            ... on TestPrefixPrefixedMessageInnerMessage {
              ...Inner
            }
            ... on TestPrefixPrefixedMessageInnerMessage2 {
              ...Inner2
            }
          }
        }
      }
      fragment Inner on TestPrefixPrefixedMessageInnerMessage {
        body
      }
      fragment Inner2 on TestPrefixPrefixedMessageInnerMessage2 {
        body
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "squashedMessage": Object {
            "body": "field 2",
          },
        },
      },
    }
  `);
});
