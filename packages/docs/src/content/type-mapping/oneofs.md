# Oneofs

How Protobuf oneofs are converted to GraphQL union types.

## Basic Conversion

A oneof generates a GraphQL union type:

```protobuf
message Media {
  string title = 1;

  oneof content {
    Image image = 2;
    Video video = 3;
  }
}

message Image {
  string url = 1;
}

message Video {
  string url = 1;
  int32 duration = 2;
}
```

```graphql
type Media {
  title: String
  content: MediaContent
}

union MediaContent = Image | Video

type Image {
  url: String
}

type Video {
  url: String
  duration: Int
}
```

## Union Naming

The union name combines the message name and oneof name:

| Message | Oneof | Union Name |
|---------|-------|------------|
| `Media` | `content` | `MediaContent` |
| `User` | `profile_type` | `UserProfileType` |

## Required Oneofs

Use `// Required.` comment to make the union non-nullable:

```protobuf
message Media {
  // Required. disallow not_set.
  oneof content {
    Image image = 1;
    Video video = 2;
  }
}
```

```graphql
type Media {
  content: MediaContent!
}
```

## Squashed Unions

Use `(graphql.object_type).squash_union = true` to convert the entire message to a union:

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

This is useful for polymorphic types where the wrapper message adds no value.

### Without squash_union

```graphql
type Content {
  content: ContentContent
}

union ContentContent = Blog | Video
```

### With squash_union

```graphql
union Content = Blog | Video
```

## Oneofs in Input Types

In input types, oneof fields are flattened as optional fields (not a union):

```protobuf
message CreateMediaInput {
  oneof content {
    ImageInput image = 1;
    VideoInput video = 2;
  }
}
```

```graphql
input CreateMediaInputInput {
  image: ImageInputInput
  video: VideoInputInput
}
```

Only one field should be provided at a time.

## Ignoring Oneofs

Exclude a oneof from generation:

```protobuf
message Example {
  oneof internal {
    option (graphql.oneof).ignore = true;

    TypeA a = 1;
    TypeB b = 2;
  }
}
```

## Ignoring Individual Oneof Fields

Exclude specific fields from the union:

```protobuf
message Media {
  oneof content {
    Image image = 1;
    Video video = 2;
    LegacyFormat legacy = 3 [(graphql.field).ignore = true];
  }
}
```

```graphql
union MediaContent = Image | Video
# LegacyFormat not included
```

## Non-Message Oneof Fields

By default, oneofs with scalar types generate unions that include those scalars. Use `ignore_non_message_oneof_fields=true` to exclude them:

```protobuf
message Example {
  oneof value {
    string text = 1;      # Excluded with option
    int32 number = 2;     # Excluded with option
    CustomType custom = 3; # Included
  }
}
```

```yaml
opt:
  - ignore_non_message_oneof_fields=true
```

This is useful when you only want message types in unions.

## See Also

- [Messages](./messages.md) - Squashed union details
- [Configuration](../protoc-gen-pothos/configuration.md) - ignore_non_message_oneof_fields option
- [Proto Annotations](../proto-annotations/reference.md) - Oneof options
