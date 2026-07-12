---
"@proto-graphql/codegen-core": minor
---

feat: add experimental `(graphql.rpc).batch` option binding and a `BatchSpec` resolver

Adds `getRpcOptions`, a getter for the new (experimental) `(graphql.rpc)` proto option, and `resolveBatchSpec`, which validates a `(graphql.rpc).batch` declaration (key/entity field inference, entity-key resolution, and key type mapping) and produces the `BatchSpec` that `protoc-gen-dataloader` generates loaders from. `entity_key` is required in both entity and group mode for now; a fallback to the entity's federation `@key` is planned once federation support lands. Not yet consumed by protoc-gen-pothos.
