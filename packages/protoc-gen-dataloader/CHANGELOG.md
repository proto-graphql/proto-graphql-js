# protoc-gen-dataloader

## 0.1.0

### Minor Changes

- [#538](https://github.com/proto-graphql/proto-graphql-js/pull/538) [`5c20dd0`](https://github.com/proto-graphql/proto-graphql-js/commit/5c20dd089d263577901baeb61bf0567dde4c9408) Thanks [@izumin5210](https://github.com/izumin5210)! - feat: add protoc-gen-dataloader, an experimental protoc plugin that generates DataLoader-based batch loaders

  For each unary RPC annotated with `(graphql.rpc).batch`, generates a typed loader accessor backed by `@proto-graphql/connect-runtime`'s `createRpcLoader`: entity mode (`DataLoader<K, Entity | null>`) for BatchGet-style RPCs, or group mode (`DataLoader<K, Entity[]>`) for one-to-many relations. Generated code depends only on Connect-ES and protobuf-es v2 — no GraphQL or Pothos dependency. See the [documentation](https://github.com/proto-graphql/proto-graphql-js/tree/main/docs/protoc-gen-dataloader) for setup and the generated-code contract. Plugin options and generated code shapes are experimental and may change without notice.

### Patch Changes

- Updated dependencies [[`5c20dd0`](https://github.com/proto-graphql/proto-graphql-js/commit/5c20dd089d263577901baeb61bf0567dde4c9408), [`5c20dd0`](https://github.com/proto-graphql/proto-graphql-js/commit/5c20dd089d263577901baeb61bf0567dde4c9408)]:
  - @proto-graphql/codegen-core@0.8.0
  - @proto-graphql/protoc-plugin-helpers@0.6.0
