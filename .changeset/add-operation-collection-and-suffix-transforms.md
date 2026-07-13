---
"@proto-graphql/codegen-core": minor
---

feat: add service/operation option bindings, RPC-to-operation collection, and requests_as_inputs/responses_as_payloads transforms

Adds `getServiceOptions`/`getRpcOptions` getters for the (experimental) `(graphql.service)`/`(graphql.rpc)` proto options, `fileHasOptedInServices` for the `protobuf_lib=protobuf-es` guard, and `collectOperationsFromFile`, which resolves each opted-in service's unary RPCs into a printable `OperationField` model (operation kind, name, flattened-vs-single-input args, return type including `expose_field`/`Empty` handling, and diagnostics for streaming RPCs and unsupported ignore/type combinations). Also adds the `requests_as_inputs`/`responses_as_payloads` file-level `(graphql.schema)` options, a suffix-transform variant of `ignore_requests`/`ignore_responses` (`ignore_*` takes precedence when both are set, with a warning). Not yet consumed outside protoc-gen-pothos's RPC operation printer.
