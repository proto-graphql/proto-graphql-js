import { graphql } from "graphql";

import { schema } from "./schema";

it("processes a query successfully", async () => {
  const resp = await graphql(
    schema,
    /* GraphQL */ `
      query Test {
        test {
          requiredPrimitives {
            ...Primitives
          }
          optionalPrimitives {
            ...Primitives
          }
          requiredPrimitivesList {
            ...Primitives
          }
          optionalPrimitivesList {
            ...Primitives
          }
        }
      }
      fragment Primitives on Primitives {
        requiredDoubleValue
        requiredFloatValue
        requiredInt32Value
        requiredInt64Value
        requiredUint32Value
        requiredUint64Value
        requiredSint32Value
        requiredSint64Value
        requiredFixed32Value
        requiredFixed64Value
        requiredSfixed32Value
        requiredSfixed64Value
        requiredBoolValue
        requiredStringValue
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "optionalPrimitives": null,
          "optionalPrimitivesList": Array [],
          "requiredPrimitives": Object {
            "requiredBoolValue": true,
            "requiredDoubleValue": 2.4,
            "requiredFixed32Value": 9,
            "requiredFixed64Value": "10",
            "requiredFloatValue": 3.5,
            "requiredInt32Value": 2,
            "requiredInt64Value": "4",
            "requiredSfixed32Value": 11,
            "requiredSfixed64Value": "12",
            "requiredSint32Value": 7,
            "requiredSint64Value": "8",
            "requiredStringValue": "foobar",
            "requiredUint32Value": 5,
            "requiredUint64Value": "6",
          },
          "requiredPrimitivesList": Array [],
        },
      },
    }
  `);
});
