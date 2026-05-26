---
"@proto-graphql/codegen-core": minor
"protoc-gen-pothos": patch
---

perf: emit Pothos type opts as direct templates instead of through `literalOf(JsObject)`, ~1.6x faster plugin runs with `format=false`
