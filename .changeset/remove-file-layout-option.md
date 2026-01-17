---
"@proto-graphql/codegen-core": minor
"@proto-graphql/protoc-plugin-helpers": minor
"protoc-gen-pothos": minor
---

Remove `fileLayout` option

The `fileLayout` option has been removed. Previously it allowed choosing between:
- `proto_file`: One output file per proto file (default)
- `graphql_type`: Separate output file for each GraphQL type

The `proto_file` layout is now the only supported behavior.

**BREAKING CHANGES:**
- `file_layout` parameter is no longer accepted
- `fileLayouts` constant is no longer exported from `@proto-graphql/codegen-core`
- `fileLayout` property has been removed from `PrinterCommonOptions` interface
