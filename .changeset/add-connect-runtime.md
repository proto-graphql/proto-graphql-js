---
"@proto-graphql/connect-runtime": minor
---

feat: add @proto-graphql/connect-runtime, a runtime package for Connect-based code generators

Provides the `ProtoGraphqlConnectContext` convention, `getClient` for memoized per-transport RPC clients, and `createRpcLoader` for building per-context, per-params `DataLoader` accessors from batch RPCs. Currently consumed by `protoc-gen-dataloader`'s generated code, with more generators expected to depend on it later. Experimental — the API may change without notice.
