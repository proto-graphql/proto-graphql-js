import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test {
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
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    {
      "data": {
        "test": {
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
