# Proto Annotations Reference

Complete reference for all GraphQL proto annotations.

## Usage

Import the annotations in your proto file:

```protobuf
import "graphql/schema.proto";
```

## File Options

### (graphql.schema)

File-level options applied to all types in the file.

| Option | Type | Description |
|--------|------|-------------|
| `type_prefix` | `string` | Prefix added to all generated type names |
| `ignore_requests` | `bool` | Ignore messages ending with `Request` |
| `ignore_responses` | `bool` | Ignore messages ending with `Response` |
| `ignore` | `bool` | Ignore entire file |

**Example:**

```protobuf
option (graphql.schema) = {
  type_prefix: "Api"
  ignore_requests: true
  ignore_responses: true
};
```

## Message Options

### (graphql.object_type)

Options for GraphQL object type generation.

| Option | Type | Description |
|--------|------|-------------|
| `ignore` | `bool` | Do not generate ObjectType and InputType |
| `squash_union` | `bool` | Convert message with oneof to union type |
| `interface` | `bool` | Generate as GraphQL interface |
| `name` | `string` | Override GraphQL type name |

**Examples:**

```protobuf
// Generate as interface
message Node {
  option (graphql.object_type).interface = true;
  uint64 id = 1;
}

// Generate as union
message Content {
  option (graphql.object_type).squash_union = true;
  oneof content {
    Blog blog = 1;
    Video video = 2;
  }
}

// Rename type
message InternalUser {
  option (graphql.object_type).name = "User";
  string name = 1;
}

// Ignore message
message Secret {
  option (graphql.object_type).ignore = true;
  string data = 1;
}
```

### (graphql.input_type)

Options for GraphQL input type generation.

| Option | Type | Description |
|--------|------|-------------|
| `no_partial` | `bool` | Do not generate partial input type |
| `ignore` | `bool` | Do not generate InputType |

**Examples:**

```protobuf
// Output only (no input type)
message ReadOnlyData {
  option (graphql.input_type).ignore = true;
  string value = 1;
}

// Disable partial input
message StrictInput {
  option (graphql.input_type).no_partial = true;
  string required_field = 1;
}
```

## Field Options

### (graphql.field)

Options for individual fields.

| Option | Type | Description |
|--------|------|-------------|
| `ignore` | `bool` | Exclude field from schema |
| `name` | `string` | Override field name |
| `skip_resolver` | `bool` | Omit resolver implementation |
| `id` | `bool` | Use GraphQL `ID` type |
| `output_nullability` | `Nullability` | Control output nullability |
| `input_nullability` | `Nullability` | Control input nullability |
| `partial_input_nullability` | `Nullability` | Control partial input nullability |

**Nullability values:**

| Value | Effect |
|-------|--------|
| `NULLABILITY_UNSPECIFIED` | Use default behavior |
| `NULLABLE` | Field is nullable |
| `NON_NULL` | Field is non-nullable (`!`) |

**Examples:**

```protobuf
message User {
  // Use ID type
  uint64 id = 1 [(graphql.field).id = true];

  // Rename field
  string user_name = 2 [(graphql.field).name = "name"];

  // Ignore field
  string internal = 3 [(graphql.field).ignore = true];

  // Skip resolver
  string computed = 4 [(graphql.field).skip_resolver = true];

  // Force non-null output
  string required = 5 [(graphql.field).output_nullability = NON_NULL];

  // Force nullable input
  string optional = 6 [(graphql.field).input_nullability = NULLABLE];
}
```

## Oneof Options

### (graphql.oneof)

Options for oneof fields.

| Option | Type | Description |
|--------|------|-------------|
| `ignore` | `bool` | Exclude oneof from schema |

**Example:**

```protobuf
message Example {
  oneof internal {
    option (graphql.oneof).ignore = true;
    TypeA a = 1;
    TypeB b = 2;
  }
}
```

## Enum Options

### (graphql.enum_type)

Options for GraphQL enum generation.

| Option | Type | Description |
|--------|------|-------------|
| `ignore` | `bool` | Do not generate enum |
| `name` | `string` | Override enum name |

**Examples:**

```protobuf
// Rename enum
enum InternalStatus {
  option (graphql.enum_type).name = "Status";
  INTERNAL_STATUS_UNSPECIFIED = 0;
  INTERNAL_STATUS_ACTIVE = 1;
}

// Ignore enum
enum Secret {
  option (graphql.enum_type).ignore = true;
  SECRET_UNSPECIFIED = 0;
  SECRET_VALUE = 1;
}
```

## Enum Value Options

### (graphql.enum_value)

Options for individual enum values.

| Option | Type | Description |
|--------|------|-------------|
| `ignore` | `bool` | Exclude value from enum |

**Example:**

```protobuf
enum Role {
  ROLE_UNSPECIFIED = 0;
  ROLE_ADMIN = 1;
  ROLE_USER = 2;
  ROLE_DEPRECATED = 3 [(graphql.enum_value).ignore = true];
}
```

## Service Options

`(graphql.service)` (opt-in for service→GraphQL-operation generation, and the sibling `(graphql.rpc)` fields `operation`/`name`/`expose_field`/`federation`) is planned but **not yet part of the proto** — it lands together with service→GraphQL-operation support. `(graphql.rpc).batch`, documented below, does not require it: `batch` is the only field currently defined on `(graphql.rpc)`, and it takes effect on its own.

## RPC Options

### (graphql.rpc).batch

> **EXPERIMENTAL.** Declares an RPC as a batch-loader generation target for [protoc-gen-dataloader](../protoc-gen-dataloader/README.md), independent of whether the RPC is (or will later be) exposed as a GraphQL operation — `batch` takes effect with no other opt-in.

```protobuf
import "graphql/schema.proto";

service UserService {
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse) {
    option (graphql.rpc).batch = { entity_key: "id" };
  }
}
```

**Fields**

| Option | Type | Description |
|--------|------|-------------|
| `key_field` | `string` | Repeated key-list field on the request. Omit to auto-infer (only valid when the request has exactly one repeated field). |
| `entity_field` | `string` | Repeated entity-list field on the response. Omit to auto-infer (only valid when the response has exactly one repeated *message* field). |
| `entity_key` | `string` | Scalar field on the entity, used to match entities back to requested keys. Required in both entity and group mode (see below). |
| `group` | `bool` | Generate a group loader (`RpcLoader<K, Entity[]>`, one key → N entities) instead of an entity loader (`RpcLoader<K, Entity \| null>`, one key → at most 1 entity). Default `false`. |
| `max_batch_size` | `uint32` | Maximum number of keys sent in a single RPC call (DataLoader's `maxBatchSize`). `0` (default) means unlimited. |

**Inference rules**

- `batch` is only valid on unary RPCs; a streaming RPC is a codegen error.
- `key_field`, if omitted, is inferred as the request's only repeated field, which must be a repeated *scalar* field. Zero, or more than one, repeated field is an error (set `key_field` explicitly to disambiguate).
- `entity_field`, if omitted, is inferred as the response's only repeated *message* field. Zero, or more than one, repeated message field is an error.
- `entity_key` must be a scalar field on the entity message whose proto type maps to the same TypeScript key type as `key_field` does (see [Generated Code Reference](../protoc-gen-dataloader/generated-code-reference.md#key-type-mapping)).
  - **Entity mode and group mode both require `entity_key` explicitly, for now.** A planned fallback — inferring it from the entity's `(graphql.object_type).federation.key` in entity mode — lands once federation support is added upstream; group mode will keep requiring it explicitly either way, since the grouping key is conceptually the *parent's* key, not the entity's own `@key`.
- Composite (multi-field) keys are not supported in this version.
- Request fields other than `key_field` become loader parameters (see [Generated Code Reference](../protoc-gen-dataloader/generated-code-reference.md#params-variants)). A parameter is type-level required on the generated loader accessor whenever its field is required under the same rules as Input type generation (`isRequiredField`): proto3 implicit-presence scalar fields are required by default; adding `optional`, or setting `(graphql.field).input_nullability = NULLABLE`, makes a field non-required. Message/enum fields are non-required by default unless marked `// Required.` or `input_nullability = NON_NULL`.

**Validation error behavior**

- All rules above are validated at codegen time, across every method in every file of the `buf generate` request, before the plugin emits anything — a single run reports every invalid `batch` declaration at once rather than stopping at the first one.
- Error messages always name the offending RPC, state what was wrong, list the actual candidate fields found on the relevant message, and include a concrete `option (graphql.rpc).batch = { ... };` example, e.g.:

  ```
  Cannot infer key_field for (graphql.rpc).batch on UserService.BatchGetUsers: request message BatchGetUsersRequest has multiple repeated fields (["ids", "tags"]). Set key_field explicitly to disambiguate. Example: option (graphql.rpc).batch = { key_field: "ids" };
  ```

- Because a protoc plugin invocation cannot partially succeed, any validation failure aborts code generation for the entire `buf generate` run; fix every reported RPC and regenerate.

See [protoc-gen-dataloader](../protoc-gen-dataloader/README.md) for the full generated-code contract this option drives.

## Field Behavior Comments

Special comments that affect field generation:

| Comment | Effect |
|---------|--------|
| `// Required.` | Field is non-nullable |
| `// Output only.` | Field excluded from InputType |
| `// Input only.` | Field excluded from ObjectType |

Comments can be combined:

```protobuf
message User {
  // Required. Output only.
  uint64 id = 1;

  // Required.
  string name = 2;

  // Input only.
  string password = 3;
}
```

## Complete Example

```protobuf
syntax = "proto3";

package example;

import "graphql/schema.proto";

option (graphql.schema) = {
  type_prefix: "Api"
  ignore_requests: true
};

message User {
  // Required. Output only.
  uint64 id = 1 [(graphql.field).id = true];

  // Required.
  string name = 2;

  string email = 3;

  Role role = 4;

  string internal_note = 5 [(graphql.field).ignore = true];

  oneof profile {
    BasicProfile basic = 6;
    PremiumProfile premium = 7;
  }
}

enum Role {
  ROLE_UNSPECIFIED = 0;
  ROLE_ADMIN = 1;
  ROLE_USER = 2;
  ROLE_LEGACY = 3 [(graphql.enum_value).ignore = true];
}

message BasicProfile {
  string bio = 1;
}

message PremiumProfile {
  string bio = 1;
  repeated string features = 2;
}
```

Generated GraphQL:

```graphql
type ApiUser {
  id: ID!
  name: String!
  email: String
  role: ApiRole
  profile: ApiUserProfile
}

union ApiUserProfile = ApiBasicProfile | ApiPremiumProfile

enum ApiRole {
  ADMIN
  USER
}

type ApiBasicProfile {
  bio: String
}

type ApiPremiumProfile {
  bio: String
  features: [String!]!
}
```
