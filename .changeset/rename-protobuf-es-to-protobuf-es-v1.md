---
"@proto-graphql/codegen-core": minor
"@proto-graphql/protoc-plugin-helpers": minor
"protoc-gen-pothos": minor
---

feat!: **BREAKING**: rename `protobuf-es` target to `protobuf-es-v1`

This prepares for future protobuf-es v2 support.

**Migration:**

Update your `buf.gen.yaml` or protoc command:

```yaml
# Before
opt:
  - protobuf_lib=protobuf-es

# After
opt:
  - protobuf_lib=protobuf-es-v1
```
