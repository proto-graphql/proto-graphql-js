import { printSchema } from "graphql";
import { expect, it } from "vitest";

import { schema } from "../schema";

it("bulids graphql schema", () => {
  expect(printSchema(schema)).toMatchFileSnapshot("./schema.graphql");
});
