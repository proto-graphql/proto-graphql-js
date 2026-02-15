# Enums

How Protobuf enums are converted to GraphQL enums.

## Basic Conversion

```protobuf
enum Role {
  ROLE_UNSPECIFIED = 0;
  ROLE_ADMIN = 1;
  ROLE_USER = 2;
}
```

```graphql
enum Role {
  ADMIN
  USER
}
```

## UNSPECIFIED Value Handling

Enum values with the pattern `<ENUM_NAME>_UNSPECIFIED` at position 0 are automatically excluded from GraphQL:

```protobuf
enum Status {
  STATUS_UNSPECIFIED = 0;  # Excluded
  STATUS_ACTIVE = 1;
  STATUS_INACTIVE = 2;
}
```

```graphql
enum Status {
  ACTIVE
  INACTIVE
}
```

### Non-UNSPECIFIED Zero Values

If the zero value doesn't follow the `_UNSPECIFIED` pattern, it's included:

```protobuf
enum Priority {
  LOW = 0;     # Included (not _UNSPECIFIED)
  MEDIUM = 1;
  HIGH = 2;
}
```

```graphql
enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## Value Name Conversion

Enum value names have the enum name prefix removed:

| Protobuf | GraphQL |
|----------|---------|
| `MY_ENUM_FOO` | `FOO` |
| `MY_ENUM_BAR` | `BAR` |
| `MY_ENUM_BAZ` | `BAZ` |

```protobuf
enum MyEnum {
  MY_ENUM_UNSPECIFIED = 0;
  MY_ENUM_FOO = 1;
  MY_ENUM_BAR = 2;
}
```

```graphql
enum MyEnum {
  FOO
  BAR
}
```

## Renaming Enums

Override the GraphQL enum name with `(graphql.enum_type).name`:

```protobuf
enum InternalStatus {
  option (graphql.enum_type).name = "Status";

  INTERNAL_STATUS_UNSPECIFIED = 0;
  INTERNAL_STATUS_ACTIVE = 1;
}
```

```graphql
enum Status {
  ACTIVE
}
```

## Ignoring Enums

Exclude an enum from generation:

```protobuf
enum Internal {
  option (graphql.enum_type).ignore = true;

  INTERNAL_UNSPECIFIED = 0;
  INTERNAL_VALUE = 1;
}
```

No GraphQL enum is generated.

## Ignoring Enum Values

Exclude specific values:

```protobuf
enum Role {
  ROLE_UNSPECIFIED = 0;
  ROLE_ADMIN = 1;
  ROLE_USER = 2;
  ROLE_DEPRECATED = 3 [(graphql.enum_value).ignore = true];
}
```

```graphql
enum Role {
  ADMIN
  USER
  # DEPRECATED not included
}
```

## Enums in Fields

```protobuf
message User {
  // Required.
  Role role = 1;
  repeated Role additional_roles = 2;
}
```

```graphql
type User {
  role: Role!
  additionalRoles: [Role!]!
}
```

