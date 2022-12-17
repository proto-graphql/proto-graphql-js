import { inputObjectType, makeSchema, nonNull } from "nexus";

import { protoFieldsPlugin } from "../../plugin";

const TestInput = Object.assign(
  inputObjectType({
    name: "TestInput",
    definition(t) {
      t.field("foo", {
        type: nonNull("String"),
        description: "Test string field",
      });
      t.field("bar", { type: nonNull("Int"), description: "Test int field" });
      t.field("baz", {
        type: nonNull("Boolean"),
        description: "Test boolean field",
      });
    },
  }),
  {
    _protoNexus: {
      fields: {
        foo: { type: nonNull("String"), description: "Test string field" },
        bar: { type: nonNull("Int"), description: "Test int field" },
        baz: { type: nonNull("Boolean"), description: "Test boolean field" },
      },
    },
  }
);

const TestSubsetInput = inputObjectType({
  name: "TestSubsetInput",
  definition(t) {
    (t as any).fromProto(TestInput, ["foo", "baz"]);
  },
});

export const schema = makeSchema({
  types: [TestInput, TestSubsetInput],
  plugins: [protoFieldsPlugin()],
  shouldGenerateArtifacts: false,
});
