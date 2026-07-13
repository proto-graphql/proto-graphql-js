---
"@proto-graphql/connect-runtime": minor
---

feat: add `callRpc`/`defaultConnectErrorHandler` on a `/graphql` subpath

Adds `callRpc(ctx, fn)`, which applies `ctx.protoGraphql.callOptions` and converts a thrown/rejected `ConnectError` into a `GraphQLError` (via `ctx.protoGraphql.errorHandler` or the new `defaultConnectErrorHandler`, which maps `err.rawMessage`/`err.code` to `message`/`extensions.code`, omitting `details` by default). These live on a new `@proto-graphql/connect-runtime/graphql` subpath rather than the root entry, so GraphQL-free consumers of the root entry (e.g. `protoc-gen-dataloader`'s generated code) never pull in the `graphql` package. Consumed by protoc-gen-pothos's generated RPC operation resolvers.
