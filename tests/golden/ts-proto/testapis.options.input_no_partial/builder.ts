import SchemaBuilder from "@pothos/core";
import { GraphQLScalarType } from "graphql";

const passthroughScalar = (name: string) =>
  new GraphQLScalarType({
    name,
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: () => null,
  });

const byteScalar = passthroughScalar("Byte");
const dateTimeScalar = passthroughScalar("DateTime");
const int64Scalar = passthroughScalar("Int64");

export const builder = new SchemaBuilder<{
  Scalars: {
    Byte: { Input: any; Output: unknown };
    DateTime: { Input: any; Output: unknown };
    Int64: { Input: any; Output: unknown };
  };
}>({});

builder.queryType({});
builder.addScalarType("Byte", byteScalar, {});
builder.addScalarType("DateTime", dateTimeScalar, {});
builder.addScalarType("Int64", int64Scalar, {});
