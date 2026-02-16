# Fields

Field behavior comments and nullability control.

## Field Behavior Comments

Proto field comments control nullability and type inclusion:

| Comment | Effect |
|---------|--------|
| `// Required.` | Field is non-nullable (`!`) |
| `// Output only.` | Field only in ObjectType, excluded from InputType |
| `// Input only.` | Field only in InputType, excluded from ObjectType |

Comments can be combined:

```protobuf
message User {
  // Required. Output only.
  uint64 id = 1;

  // Required.
  string name = 2;

  // Input only.
  string password = 3;

  // Optional field (no comment)
  string bio = 4;
}
```

```graphql
type User {
  id: String!      # Required, included (Output only)
  name: String!    # Required, included
  # password excluded (Input only)
  bio: String      # Nullable
}

input UserInput {
  # id excluded (Output only)
  name: String!    # Required, included
  password: String # Included (Input only), nullable without Required
  bio: String      # Nullable
}
```

## Explicit Nullability Control

Override nullability with proto annotations:

### Output Nullability

```protobuf
message Example {
  string nullable_field = 1 [(graphql.field).output_nullability = NULLABLE];
  string non_null_field = 2 [(graphql.field).output_nullability = NON_NULL];
}
```

```graphql
type Example {
  nullableField: String   # Forced nullable
  nonNullField: String!   # Forced non-null
}
```

### Input Nullability

```protobuf
message Example {
  string field = 1 [(graphql.field).input_nullability = NON_NULL];
}
```

```graphql
input ExampleInput {
  field: String!
}
```

### Partial Input Nullability

When using `partial_inputs=true`:

```protobuf
message Example {
  // Required.
  string always_required = 1 [(graphql.field).partial_input_nullability = NON_NULL];
}
```

```graphql
input ExamplePartialInput {
  alwaysRequired: String!  # Stays non-null even in partial input
}
```

## Nullability Values

| Value | Effect |
|-------|--------|
| `NULLABILITY_UNSPECIFIED` | Use default behavior |
| `NULLABLE` | Field is nullable |
| `NON_NULL` | Field is non-nullable (`!`) |

## Repeated Fields

Repeated fields always generate non-null lists with non-null items:

```protobuf
message Example {
  repeated string tags = 1;
}
```

```graphql
type Example {
  tags: [String!]!
}
```

## ID Fields

Use `(graphql.field).id = true` to use GraphQL `ID` type:

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

## Renaming Fields

Override the field name with `(graphql.field).name`:

```protobuf
message User {
  string user_name = 1 [(graphql.field).name = "name"];
}
```

```graphql
type User {
  name: String  # Not userName
}
```

By default, field names are converted from snake_case to camelCase:

```protobuf
message Example {
  string first_name = 1;  # → firstName
  string lastName = 2;    # → lastName (preserved)
}
```

## Ignoring Fields

Exclude fields from generation:

```protobuf
message User {
  string name = 1;
  string internal_data = 2 [(graphql.field).ignore = true];
}
```

```graphql
type User {
  name: String
  # internalData not included
}
```

## Skip Resolver

Omit resolver implementation:

```protobuf
message User {
  string computed_field = 1 [(graphql.field).skip_resolver = true];
}
```

This generates the field type but skips the resolver, allowing you to implement it manually.

