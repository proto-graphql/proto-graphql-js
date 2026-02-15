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
