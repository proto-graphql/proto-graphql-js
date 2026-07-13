# @proto-graphql/connect-runtime

## 0.1.0

### Minor Changes

- [#538](https://github.com/proto-graphql/proto-graphql-js/pull/538) [`5c20dd0`](https://github.com/proto-graphql/proto-graphql-js/commit/5c20dd089d263577901baeb61bf0567dde4c9408) Thanks [@izumin5210](https://github.com/izumin5210)! - feat: add @proto-graphql/connect-runtime, a runtime package for Connect-based code generators

  Provides the `ProtoGraphqlConnectContext` convention, `getClient` for memoized per-transport RPC clients, and `createRpcLoader` for building per-context, per-params `DataLoader` accessors from batch RPCs. Currently consumed by `protoc-gen-dataloader`'s generated code, with more generators expected to depend on it later. Experimental — the API may change without notice.
