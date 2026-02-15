# Scalars

Protobuf scalar types to GraphQL scalar mappings.

## Default Mappings

### Integer Types

| Protobuf | GraphQL (ts-proto) | GraphQL (protobuf-es-v1) |
|----------|-------------------|----------------------|
| `int32` | `Int` | `Int` |
| `uint32` | `Int` | `Int` |
| `sint32` | `Int` | `Int` |
| `fixed32` | `Int` | `Int` |
| `sfixed32` | `Int` | `Int` |
| `int64` | `String` | `Int64` |
| `uint64` | `String` | `Int64` |
| `sint64` | `String` | `Int64` |
| `fixed64` | `String` | `Int64` |
| `sfixed64` | `String` | `Int64` |

> **Note:** ts-proto maps 64-bit integers to `String` because JavaScript's `number` type cannot safely represent all 64-bit integer values.

### Floating Point Types

| Protobuf | GraphQL |
|----------|---------|
| `float` | `Float` |
| `double` | `Float` |

### Other Types

| Protobuf | GraphQL |
|----------|---------|
| `string` | `String` |
| `bool` | `Boolean` |
| `bytes` | `Byte` |

## Well-Known Types

### Wrapper Types

Wrapper types are nullable versions of scalar types:

| Protobuf | GraphQL (ts-proto) | GraphQL (protobuf-es-v1) |
|----------|-------------------|----------------------|
| `google.protobuf.Int32Value` | `Int` | `Int` |
| `google.protobuf.UInt32Value` | `Int` | `Int` |
| `google.protobuf.Int64Value` | `String` | `Int64` |
| `google.protobuf.UInt64Value` | `String` | `Int64` |
| `google.protobuf.SInt32Value` | `Int` | `Int` |
| `google.protobuf.SInt64Value` | `String` | `Int64` |
| `google.protobuf.Fixed32Value` | `Int` | `Int` |
| `google.protobuf.Fixed64Value` | `String` | `Int64` |
| `google.protobuf.SFixed32Value` | `Int` | `Int` |
| `google.protobuf.SFixed64Value` | `String` | `Int64` |
| `google.protobuf.FloatValue` | `Float` | `Float` |
| `google.protobuf.DoubleValue` | `Float` | `Float` |
| `google.protobuf.StringValue` | `String` | `String` |
| `google.protobuf.BoolValue` | `Boolean` | `Boolean` |
| `google.protobuf.BytesValue` | `Byte` | `Byte` |

### Timestamp

| Protobuf | GraphQL |
|----------|---------|
| `google.protobuf.Timestamp` | `DateTime` |

## Custom Scalar Mappings

Override default mappings with the `scalar` option:

```yaml
opt:
  - scalar=proto_type=GraphQLType
```

### Example: Map 64-bit integers to BigInt

```yaml
opt:
  - scalar=int64=BigInt
  - scalar=uint64=BigInt
  - scalar=sint64=BigInt
  - scalar=fixed64=BigInt
  - scalar=sfixed64=BigInt
  - scalar=google.protobuf.Int64Value=BigInt
  - scalar=google.protobuf.UInt64Value=BigInt
  - scalar=google.protobuf.SInt64Value=BigInt
  - scalar=google.protobuf.Fixed64Value=BigInt
  - scalar=google.protobuf.SFixed64Value=BigInt
```

### Example: Map custom types

```yaml
opt:
  - scalar=google.type.Date=Date
  - scalar=google.type.Money=Money
```

### Example: Use Int for 64-bit integers

```yaml
opt:
  - scalar=int64=Int
  - scalar=uint64=Int
```

> **Warning:** This may lose precision for values larger than `Number.MAX_SAFE_INTEGER`.

## ID Type

Use `(graphql.field).id = true` to use GraphQL `ID` type instead of the mapped scalar:

```protobuf
message User {
  // Required. Output only.
  uint64 id = 1 [(graphql.field).id = true];
}
```

```graphql
type User {
  id: ID!
}
```

