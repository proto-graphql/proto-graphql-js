---
"protoc-gen-dataloader": minor
---

feat: add protoc-gen-dataloader, an experimental protoc plugin that generates DataLoader-based batch loaders

For each unary RPC annotated with `(graphql.rpc).batch`, generates a typed loader accessor backed by `@proto-graphql/connect-runtime`'s `createRpcLoader`: entity mode (`DataLoader<K, Entity | null>`) for BatchGet-style RPCs, or group mode (`DataLoader<K, Entity[]>`) for one-to-many relations. Generated code depends only on Connect-ES and protobuf-es v2 — no GraphQL or Pothos dependency. See the [documentation](https://github.com/proto-graphql/proto-graphql-js/tree/main/docs/protoc-gen-dataloader) for setup and the generated-code contract. Plugin options and generated code shapes are experimental and may change without notice.
