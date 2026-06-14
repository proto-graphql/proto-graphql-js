---
"@proto-graphql/codegen-core": patch
---

perf(codegen-core): memoize the protobuf registry per schema

`createRegistryFromSchema` is called once per generated file, but the registry
only depends on `schema.allFiles`, which is constant for the whole plugin run.
Building it per file made registry construction scale with files² and dominated
CPU profiles on large schemas. Memoizing by the schema object builds the
registry exactly once per run (~23% faster end-to-end with `format=false` on a
538-file schema).
