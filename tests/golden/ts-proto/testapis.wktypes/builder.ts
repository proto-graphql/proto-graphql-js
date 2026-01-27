import SchemaBuilder from "@pothos/core";
import { GraphQLByte, GraphQLDateTime } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    Byte: { Input: Buffer; Output: string | Buffer };
    DateTime: { Input: Date; Output: Date };
  };
}>({});
builder.queryType({});

builder.addScalarType("Byte", GraphQLByte, {});
builder.addScalarType("DateTime", GraphQLDateTime, {});
