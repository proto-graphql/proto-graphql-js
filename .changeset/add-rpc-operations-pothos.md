---
"protoc-gen-pothos": minor
---

feat: generate GraphQL Query/Mutation fields with full resolvers from RPC services (experimental)

Services annotated with `(graphql.service)` now have their unary RPCs generated as `builder.queryField`/`builder.mutationField` calls, including a complete resolver that assembles the request, calls the RPC via `@proto-graphql/connect-runtime`'s `getClient`/`callRpc`, and maps the response (or a thrown `ConnectError`, converted to a `GraphQLError` with `extensions.code`) back into GraphQL. Operation kind defaults from `idempotency_level` (overridable via `(graphql.rpc).operation`), field names default to camelCase of the RPC name (overridable via `name`), Query arguments are flattened while Mutations take a single `input`, and `(graphql.rpc).expose_field`/`ignore` and streaming-RPC skipping are supported. Requires `protobuf_lib=protobuf-es` (protobuf-es v2 / Connect-ES v2) — using `(graphql.service)` with any other runtime is a codegen error. Fully additive: output for files/services that never set `(graphql.service)` is unchanged. See [RPC Operations](https://github.com/proto-graphql/proto-graphql-js/blob/main/docs/protoc-gen-pothos/rpc-operations.md).
