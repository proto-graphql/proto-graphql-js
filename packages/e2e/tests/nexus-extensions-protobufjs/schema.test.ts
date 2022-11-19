import { graphql } from "graphql";
import { schema } from "./schema";

it("processes a query with squashed union successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        testSquashedUnion {
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
        "testSquashedUnion": Object {
          "squashedMessage": Object {
            "body": "field 2",
          },
        },
      },
    }
  `);
});

it("processes a query with interface successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        testInterface {
          interfaceMessage {
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
        "testInterface": Object {
          "interfaceMessage": Object {
            "body": "inner message2",
          },
        },
      },
    }
  `);
});

it("processes a query with skipResolver successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        testSkipResolver {
          squashedMessage {
            ... on TestPrefixPrefixedMessageInnerMessage {
              ...Inner
            }
          }
        }
      }
      fragment Inner on TestPrefixPrefixedMessageInnerMessage {
        skipResolver
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "testSkipResolver": Object {
          "squashedMessage": Object {
            "skipResolver": "implemented",
          },
        },
      },
    }
  `);
});
