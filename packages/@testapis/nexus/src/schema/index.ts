import * as path from "path";
import { makeSchema } from "@nexus/schema";
import * as helloTypes from "./types/hello";

export const helloSchema = makeSchema({
  types: helloTypes,
  outputs: {
    schema: path.join(__dirname, "../__generated__/hello/schema.graphql"),
    typegen: path.join(__dirname, "../__generated__/hello/typings.ts"),
  },
});
