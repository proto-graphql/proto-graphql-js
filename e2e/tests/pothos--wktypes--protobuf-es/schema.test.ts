import { graphql } from "graphql";
import { expect, it } from "vitest";

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
        timestamp
        int32Value
        int64Value
        uint32Value
        uint64Value
        floatValue
        doubleValue
        boolValue
        stringValue
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "valuesArePresent": {
          "boolValue": true,
          "doubleValue": 2.4,
          "floatValue": 3.5,
          "int32Value": 2,
          "int64Value": 4,
          "stringValue": "foobar",
          "timestamp": 2020-12-28T06:42:05.453Z,
          "uint32Value": 5,
          "uint64Value": 6,
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
        timestamp
        int32Value
        int64Value
        uint32Value
        uint64Value
        floatValue
        doubleValue
        boolValue
        stringValue
      }
    `,
  });
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "valuesAreBlank": {
          "boolValue": null,
          "doubleValue": null,
          "floatValue": null,
          "int32Value": null,
          "int64Value": null,
          "stringValue": null,
          "timestamp": null,
          "uint32Value": null,
          "uint64Value": null,
        },
      },
    }
  `);
});
