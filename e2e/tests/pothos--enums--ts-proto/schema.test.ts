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
      fragment Message on MessageWithEnums {
        requiredMyEnum
        requiredMyEnumWithoutUnspecified
        optionalMyEnum
        optionalMyEnumWithoutUnspecified
      }
    `
  );
  expect(resp).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "test": Object {
          "optionalMyEnum": null,
          "optionalMyEnumWithoutUnspecified": "FOO",
          "requiredMyEnum": "BAR",
          "requiredMyEnumWithoutUnspecified": "FOO",
        },
      },
    }
  `);
});
