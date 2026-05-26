---
"@proto-graphql/codegen-core": patch
---

perf: cache frozen empty-default `[graphql.*]` option messages to remove `createZeroMessage` allocations on every descriptor lookup, ~27% faster `protoc-gen-pothos` runs with `format=false`
