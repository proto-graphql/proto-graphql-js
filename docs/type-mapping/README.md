# Type Mapping Overview

How Protocol Buffer types map to GraphQL types.

## Quick Reference

| Protobuf | GraphQL |
|----------|---------|
| `message` | `type` (object) + `input` |
| `message` with `squash_union` | `union` |
| `message` with `interface` | `interface` |
| `enum` | `enum` |
| `oneof` | `union` |
| `repeated T` | `[T!]!` |
| `optional T` | `T` (nullable) |

## Scalar Type Mapping

| Protobuf | GraphQL (ts-proto) | GraphQL (protobuf-es) |
|----------|-------------------|----------------------|
| `int32`, `uint32`, `sint32`, `fixed32`, `sfixed32` | `Int` | `Int` |
| `int64`, `uint64`, `sint64`, `fixed64`, `sfixed64` | `String` | `Int64` |
| `float`, `double` | `Float` | `Float` |
| `string` | `String` | `String` |
| `bool` | `Boolean` | `Boolean` |
| `bytes` | `Byte` | `Byte` |
| `google.protobuf.Timestamp` | `DateTime` | `DateTime` |

See [Scalars](./scalars.md) for complete mappings and customization.

## Nullability Rules

| Field Type | GraphQL Output | GraphQL Input |
|------------|---------------|---------------|
| Regular field | Nullable | Nullable |
| `// Required.` comment | Non-null (`!`) | Non-null (`!`) |
| `// Output only.` comment | Included | Excluded |
| `// Input only.` comment | Excluded | Included |
| `repeated` field | `[T!]!` | `[T!]!` |

See [Fields](./fields.md) for detailed nullability control.

