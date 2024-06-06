import type { Timestamp } from "@bufbuild/protobuf";
import SchemaBuilder from "@pothos/core";
import { ProtoGraphQLDateTime } from "@proto-graphql/scalars-protobuf-es";
import { GraphQLBigInt, GraphQLByte } from "graphql-scalars";

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
