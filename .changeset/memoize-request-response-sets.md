---
"@proto-graphql/codegen-core": patch
---

perf(codegen-core): memoize request/response type sets per file set

`exceptRequestOrResponse` rebuilt its request/response type sets by scanning
every service method of every file, and it was invoked three times per file by
the object/input/interface builders in `collectTypesFromFile` (which itself runs
once per generated file). On large schemas this scan dominated CPU profiles
(~22% of self time on a 538-file schema). The sets depend only on the `files`
array, which is stable for the whole run, so memoize the predicate by it and
build the sets exactly once.
