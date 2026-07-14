import type { CallOptions, ConnectError, Transport } from "@connectrpc/connect";
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

// Structurally satisfies `ProtoGraphqlConnectContext` (design.md §3.3):
// generated resolvers call `getClient(ctx, Service)` / `callRpc(ctx, ...)`,
// which only need `ctx.protoGraphql.transport`. The optional hooks below
// mirror the full runtime contract so execution tests can exercise them
// (e.g. `callOptions`).
export interface Context {
  protoGraphql: {
    transport: Transport;
    transports?: Map<string, Transport>;
    callOptions?: (ctx: unknown) => CallOptions;
    errorHandler?: (err: ConnectError) => Error;
  };
}

export const builder = new SchemaBuilder<{
  Context: Context;
  Scalars: {
    Byte: { Input: any; Output: unknown };
    DateTime: { Input: any; Output: unknown };
    Int64: { Input: any; Output: unknown };
  };
}>({});

builder.queryType({});
builder.mutationType({});
builder.addScalarType("Byte", byteScalar, {});
builder.addScalarType("DateTime", dateTimeScalar, {});
builder.addScalarType("Int64", int64Scalar, {});
