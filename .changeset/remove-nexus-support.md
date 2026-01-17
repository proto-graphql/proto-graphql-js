---
"@proto-graphql/codegen-core": major
"@proto-graphql/protoc-plugin-helpers": major
"protoc-gen-pothos": patch
---

Remove unused nexus and google-protobuf/protobufjs support code

Following the removal of protoc-gen-nexus:
- Remove `@proto-graphql/proto-descriptors` package
- Remove `parseNexusOptions` export and `dsl: "nexus"` type
- Remove `google-protobuf` and `protobufjs` runtime support (pothos only supports `ts-proto` and `protobuf-es`)
- Remove `use_protobufjs` option

**BREAKING CHANGES:**
- `@proto-graphql/proto-descriptors` package has been removed
- `parseNexusOptions` is no longer exported from `@proto-graphql/protoc-plugin-helpers`
- `google-protobuf` and `protobufjs` are no longer valid values for `protobuf_lib` option
