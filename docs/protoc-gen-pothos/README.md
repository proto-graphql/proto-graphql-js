# protoc-gen-pothos

A protoc plugin that generates [Pothos GraphQL](https://pothos-graphql.dev/) schema builder code from Protocol Buffer definitions.

## What It Generates

For each `.proto` file, the plugin generates a corresponding `.pb.pothos.ts` file containing:

- **Object type references** (`$Ref`) - Pothos type references for GraphQL object types
- **Input type references** - Type references for GraphQL input types
- **Enum definitions** - GraphQL enum types
- **Union type references** - For oneof fields
- **Field resolvers** - Type-safe resolver implementations

## Supported Protobuf Libraries

| Library | Status |
|---------|--------|
| [ts-proto](https://github.com/stephenh/ts-proto) | Supported (recommended) |
| [protobuf-es](https://github.com/bufbuild/protobuf-es) | Supported |

## Generated File Structure

### proto_file layout (default)

One generated file per `.proto` file:

```
proto/
└── example/
    └── user.proto

src/__generated__/pothos/
└── example/
    └── user.pb.pothos.ts
```

### graphql_type layout

One generated file per GraphQL type:

```
src/__generated__/pothos/
└── example/
    ├── User.pb.pothos.ts
    ├── UserInput.pb.pothos.ts
    └── UserRole.pb.pothos.ts
```

## Example

**Proto definition:**

```protobuf
syntax = "proto3";
package example;

message User {
  // Required. Output only.
  uint64 id = 1;
  // Required.
  string name = 2;
}
```

**Generated code (simplified):**

```typescript
import { builder } from "../../builder";

export const User$Ref = builder.objectRef<User>("User");

User$Ref.implement({
  fields: (t) => ({
    id: t.field({ type: "String", nullable: false, resolve: (parent) => parent.id }),
    name: t.field({ type: "String", nullable: false, resolve: (parent) => parent.name }),
  }),
});
```

