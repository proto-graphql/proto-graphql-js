import SchemaBuilder from "@pothos/core";
import { GraphQLDateTime } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
}>({});
builder.queryType({});

builder.addScalarType("DateTime", GraphQLDateTime, {});
