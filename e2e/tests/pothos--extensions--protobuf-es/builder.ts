import SchemaBuilder from "@pothos/core";
import { GraphQLBigInt, GraphQLByte } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    Int64: { Input: bigint; Output: bigint };
  };
}>({});
builder.queryType({});

builder.addScalarType("Int64", GraphQLBigInt, {});
