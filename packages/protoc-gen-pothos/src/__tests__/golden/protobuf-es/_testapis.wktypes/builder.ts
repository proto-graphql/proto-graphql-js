import SchemaBuilder from "@pothos/core";
import { GraphQLBigInt, GraphQLByte, GraphQLDateTime } from "graphql-scalars";

export const builder = new SchemaBuilder<{
  Scalars: {
    Int64: { Input: bigint; Output: bigint };
    Byte: { Input: Uint8Array<ArrayBuffer>; Output: Uint8Array<ArrayBuffer> };
    DateTime: { Input: Date; Output: Date };
  };
}>({});

builder.queryType({});
builder.addScalarType("Int64", GraphQLBigInt, {});
builder.addScalarType("Byte", GraphQLByte, {});
builder.addScalarType("DateTime", GraphQLDateTime, {});
