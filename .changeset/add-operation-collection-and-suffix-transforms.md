---
"@proto-graphql/codegen-core": minor
---

feat: add RPC-operation option bindings, RPC-to-operation collection, and requests_as_inputs/responses_as_payloads transforms

Adds a `getRpcOptions` getter for the (experimental) `(graphql.rpc)` proto option, `fileHasExposedRpcs` for the `protobuf_lib=protobuf-es` guard, and `collectOperationsFromFile`, which resolves every RPC whose `(graphql.rpc).operation` is explicitly `QUERY` or `MUTATION` into a printable `OperationField` model (operation kind, name, flattened-vs-single-input args, return type including `expose_field`/`Empty` handling, and diagnostics for streaming RPCs and unsupported ignore/type combinations). There is no service-level opt-in and `idempotency_level` is never consulted — an RPC with no `operation` set is silently not collected. Also adds the `requests_as_inputs`/`responses_as_payloads` file-level `(graphql.schema)` options, a suffix-transform variant of `ignore_requests`/`ignore_responses` (`ignore_*` takes precedence when both are set, with a warning). Not yet consumed outside protoc-gen-pothos's RPC operation printer.
