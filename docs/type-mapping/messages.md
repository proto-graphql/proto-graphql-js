# Messages

How Protobuf messages are converted to GraphQL types.

## Basic Conversion

By default, each Protobuf message generates both an ObjectType and an InputType:

```protobuf
message User {
  string name = 1;
  string email = 2;
}
```

```graphql
type User {
  name: String
  email: String
}

input UserInput {
  name: String
  email: String
}
```

## Nested Messages

Nested messages use underscore-separated naming:

```protobuf
message User {
  message Address {
    string city = 1;
  }
  Address address = 1;
}
```

```graphql
type User {
  address: User_Address
}

type User_Address {
  city: String
}
```

## Interface Generation

Use `(graphql.object_type).interface = true` to generate a GraphQL interface instead of an object type:

```protobuf
message Node {
  option (graphql.object_type).interface = true;

  uint64 id = 1;
}
```

```graphql
interface Node {
  id: String
}
```

## Squashed Union

Use `(graphql.object_type).squash_union = true` to convert a message with a oneof to a union type:

```protobuf
message Content {
  option (graphql.object_type).squash_union = true;

  oneof content {
    Blog blog = 1;
    Video video = 2;
  }
}
```

```graphql
union Content = Blog | Video
```

Without `squash_union`, this would generate:

```graphql
type Content {
  content: ContentContent
}

union ContentContent = Blog | Video
```

## Type Prefix

Add a prefix to all generated type names with `(graphql.schema).type_prefix`:

```protobuf
option (graphql.schema).type_prefix = "Api";

message User {
  string name = 1;
}
```

```graphql
type ApiUser {
  name: String
}
```

## Renaming Types

Override the GraphQL type name with `(graphql.object_type).name`:

```protobuf
message InternalUser {
  option (graphql.object_type).name = "User";

  string name = 1;
}
```

```graphql
type User {
  name: String
}
```

## Ignoring Messages

### Ignore Both ObjectType and InputType

```protobuf
message Internal {
  option (graphql.object_type).ignore = true;

  string data = 1;
}
```

No GraphQL types are generated for this message. Nested messages are still processed.

### Ignore InputType Only

```protobuf
message ReadOnlyData {
  option (graphql.input_type).ignore = true;

  string value = 1;
}
```

```graphql
type ReadOnlyData {
  value: String
}
# No input type generated
```

## Ignoring Request/Response Messages

Use file-level options to ignore RPC request and response messages:

```protobuf
option (graphql.schema).ignore_requests = true;
option (graphql.schema).ignore_responses = true;

message GetUserRequest {
  uint64 id = 1;
}

message GetUserResponse {
  User user = 1;
}
```

Messages ending with `Request` or `Response` are excluded from generation.

## Ignoring Entire Files

```protobuf
option (graphql.schema).ignore = true;

message Internal {
  string data = 1;
}
```

No types are generated from this file.

## Partial Input Types

When `partial_inputs=true` is set in plugin options, additional partial input types are generated with all fields nullable:

```protobuf
message User {
  // Required.
  string name = 1;
  string email = 2;
}
```

```graphql
input UserInput {
  name: String!
  email: String
}

input UserPartialInput {
  name: String  # Now nullable
  email: String
}
```

Disable partial inputs for specific messages with `(graphql.input_type).no_partial`:

```protobuf
message Config {
  option (graphql.input_type).no_partial = true;

  string key = 1;
  string value = 2;
}
```

