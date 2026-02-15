# Configuration Reference

All options for protoc-gen-pothos plugin.

## Required Options

### pothos_builder_path

Path to the file that exports the Pothos builder instance.

- **Type:** `string`
- **Required:** Yes

```yaml
opt:
  - pothos_builder_path=../../builder
```

The path is resolved relative to the generated file location.

### import_prefix

Path to the output directory of ts-proto or protobuf-es generated files.

- **Type:** `string`
- **Required:** Yes (when using ts-proto)

```yaml
opt:
  - import_prefix=../proto
```

## Optional Options

### protobuf_lib

Specifies the protobuf implementation to use.

- **Type:** `string`
- **Default:** `ts-proto`
- **Values:** `ts-proto`, `protobuf-es-v1`, `protobuf-es`

```yaml
opt:
  - protobuf_lib=ts-proto
```

| Value | Runtime | Description |
|-------|---------|-------------|
| `ts-proto` | ts-proto | Uses `$type` property for type discrimination |
| `protobuf-es-v1` | @bufbuild/protobuf v1.x | Uses `instanceof` for type discrimination |
| `protobuf-es` | @bufbuild/protobuf v2.x | Uses `isMessage()` function for type discrimination |

**Note:** When using `protobuf-es`, you need to install `@bufbuild/protobuf` v2.x as a dependency:

```bash
npm install @bufbuild/protobuf@^2.0.0
```

### emit_imported_files

Generate types for imported `.proto` files.

- **Type:** `boolean`
- **Default:** `false`

```yaml
opt:
  - emit_imported_files=true
```

When `true`, the plugin generates GraphQL types for messages defined in imported proto files, not just the files being processed directly.

### partial_inputs

Generate partial input types with all fields nullable.

- **Type:** `boolean`
- **Default:** `false`

```yaml
opt:
  - partial_inputs=true
```

When enabled, generates both regular input types and partial input types (e.g., `UserInput` and `UserPartialInput`).

### ignore_non_message_oneof_fields

Ignore oneof fields that are not message types.

- **Type:** `boolean`
- **Default:** `false`

```yaml
opt:
  - ignore_non_message_oneof_fields=true
```

When enabled, oneof fields with scalar types (string, int32, etc.) are excluded from the generated union types.

### scalar

Add custom scalar type mappings.

- **Type:** `string` (repeatable)
- **Format:** `proto_type=graphql_type`

```yaml
opt:
  - scalar=google.type.Date=Date
  - scalar=int64=BigInt
```

See [Scalars](../type-mapping/scalars.md) for default mappings and customization.

**Example: Map 64-bit integers to BigInt**

```yaml
opt:
  - scalar=int64=BigInt
  - scalar=uint64=BigInt
  - scalar=sint64=BigInt
  - scalar=fixed64=BigInt
  - scalar=sfixed64=BigInt
  - scalar=google.protobuf.Int64Value=BigInt
  - scalar=google.protobuf.UInt64Value=BigInt
```

## Complete Example

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  - local: protoc-gen-ts_proto
    out: ../src/__generated__/proto
    opt:
      - esModuleInterop=true
      - unrecognizedEnum=false
      - outputTypeRegistry=true

  - local: protoc-gen-pothos
    out: ../src/__generated__/pothos
    opt:
      - pothos_builder_path=../../builder
      - import_prefix=../proto
      - protobuf_lib=ts-proto
      - partial_inputs=true
      - emit_imported_files=false
      - scalar=google.type.Date=Date
```

