import SchemaBuilder from "@pothos/core";
import { GraphQLByte } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    Byte: { Input: Buffer; Output: string | Buffer };
  };
}>({});
builder.queryType({});

builder.addScalarType("Byte", GraphQLByte, {});
