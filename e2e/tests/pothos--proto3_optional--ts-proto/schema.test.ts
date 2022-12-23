import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
      query Test {
        valuesArePresent {
          ...Message
        }
      }
      fragment Message on Message {
        requiredStringValue
        optionalStringValue
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "valuesArePresent": {
          "optionalStringValue": "optional field",
          "requiredStringValue": "required field",
        },
      },
    }
  `);
});

it("processes a query successfully when values are blank", async () => {
  const resp = await graphql({
    schema,
    source: /* GraphQL */ `
      query Test {
        valuesAreBlank {
          ...Message
        }
      }
      fragment Message on Message {
        requiredStringValue
        optionalStringValue
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "valuesAreBlank": {
          "optionalStringValue": null,
          "requiredStringValue": "",
        },
      },
    }
  `);
});
