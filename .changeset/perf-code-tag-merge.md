---
"protoc-gen-pothos": patch
---

perf: shrink `code` template-tag output (merge adjacent strings) and switch `markAsPrintableArray` to direct symbol assignment, ~10% faster plugin runs with `format=false`
