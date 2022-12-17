import { GraphQLInputObjectType } from "graphql";

import { schema } from "./__helpers__/testSchema";

it("creates subset types", () => {
  const type = schema.getType("TestSubsetInput") as GraphQLInputObjectType;
  const fields = type.getFields();
  expect(
    Object.values(fields).map((f) => ({
      name: f.name,
      description: f.description,
      type: f.type,
    }))
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "description": "Test string field",
        "name": "foo",
        "type": "String!",
      },
      Object {
        "description": "Test boolean field",
        "name": "baz",
        "type": "Boolean!",
      },
    ]
  `);
});
