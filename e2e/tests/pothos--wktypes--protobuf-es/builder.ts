import SchemaBuilder from "@pothos/core";
import { GraphQLBigInt, GraphQLByte } from "graphql-scalars";
import { ProtoGraphQLDateTime } from "@proto-graphql/scalars-protobuf-es";
import { Timestamp } from "@bufbuild/protobuf";

export const builder = new SchemaBuilder<{
  Scalars: {
    Int64: { Input: bigint; Output: bigint };
    Byte: { Input: Buffer; Output: string | Buffer };
    DateTime: { Input: Timestamp; Output: Timestamp };
  };
}>({});
builder.queryType({});

builder.addScalarType("Int64", GraphQLBigInt, {});
builder.addScalarType("Byte", GraphQLByte, {});
builder.addScalarType("DateTime", ProtoGraphQLDateTime, {});
