---
"@proto-graphql/codegen-core": minor
---

feat: add experimental `(graphql.service)`/`(graphql.rpc)` option bindings and a `BatchSpec` resolver

Adds `getServiceOptions`/`getRpcOptions` getters for the new (experimental) `(graphql.service)` and `(graphql.rpc)` proto options, and `resolveBatchSpec`, which validates a `(graphql.rpc).batch` declaration (key/entity field inference, entity-key resolution including its federation `@key` fallback, and key type mapping) and produces the `BatchSpec` that `protoc-gen-dataloader` generates loaders from. Not yet consumed by protoc-gen-pothos.
