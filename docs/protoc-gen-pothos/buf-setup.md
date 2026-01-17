# Buf Configuration

This guide covers the complete Buf setup for protoc-gen-pothos.

## buf.yaml

Configure Buf workspace and dependencies:

```yaml
# proto/buf.yaml
version: v2
deps:
  - buf.build/proto-graphql/proto-graphql
```

The `buf.build/proto-graphql/proto-graphql` dependency provides:
- `graphql/schema.proto` - GraphQL annotations for customizing generation

Run `buf dep update` to download dependencies.

## buf.gen.yaml with ts-proto

Recommended configuration for ts-proto:

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  # ts-proto for TypeScript message types
  - local: protoc-gen-ts_proto
    out: ../src/__generated__/proto
    opt:
      - esModuleInterop=true      # Required for proper imports
      - unrecognizedEnum=false    # Required
      - outputTypeRegistry=true   # Required for type resolution

  # protoc-gen-pothos for GraphQL schema
  - local: protoc-gen-pothos
    out: ../src/__generated__/pothos
    opt:
      - pothos_builder_path=../../builder
      - import_prefix=../proto
      - protobuf_lib=ts-proto
```

### Required ts-proto Options

| Option | Purpose |
|--------|---------|
| `esModuleInterop=true` | Enables ES module interop for imports |
| `unrecognizedEnum=false` | Prevents unrecognized enum handling |
| `outputTypeRegistry=true` | Enables type registry for runtime type resolution |

## buf.gen.yaml with protobuf-es

Configuration for protobuf-es:

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  # protobuf-es for TypeScript message types
  - local: protoc-gen-es
    out: ../src/__generated__/proto
    opt:
      - target=ts

  # protoc-gen-pothos for GraphQL schema
  - local: protoc-gen-pothos
    out: ../src/__generated__/pothos
    opt:
      - pothos_builder_path=../../builder
      - import_prefix=../proto
      - protobuf_lib=protobuf-es
```

## Recommended Project Structure

```
project/
├── proto/
│   ├── buf.yaml           # Buf configuration
│   ├── buf.gen.yaml       # Code generation config
│   └── example/
│       └── user.proto     # Your proto definitions
├── src/
│   ├── __generated__/
│   │   ├── proto/         # ts-proto output
│   │   │   └── example/
│   │   │       └── user.ts
│   │   └── pothos/        # protoc-gen-pothos output
│   │       └── example/
│   │           └── user.pb.pothos.ts
│   ├── builder.ts         # Pothos builder
│   └── schema.ts          # GraphQL schema
└── package.json
```

## Path Resolution

### pothos_builder_path

Resolved relative to each generated file:

```
src/__generated__/pothos/example/user.pb.pothos.ts
                         └── import { builder } from "../../builder"
                                                      └── resolves to src/builder.ts
```

### import_prefix

Resolved relative to each generated file:

```
src/__generated__/pothos/example/user.pb.pothos.ts
                         └── import { User } from "../proto/example/user"
                                                   └── resolves to src/__generated__/proto/example/user.ts
```

## Code Generation

```bash
# Navigate to proto directory
cd proto

# Update dependencies (first time or when buf.yaml changes)
buf dep update

# Generate code
buf generate
```

## Using GraphQL Annotations

Import annotations in your proto files:

```protobuf
syntax = "proto3";
package example;

import "graphql/schema.proto";

message User {
  // Required. Output only.
  uint64 id = 1 [(graphql.field).id = true];
  // Required.
  string name = 2;
}
```

See [Proto Annotations](../proto-annotations/reference.md) for all available annotations.

## Troubleshooting

### Import not found

If you see import errors for `graphql/schema.proto`:

1. Ensure `buf.build/proto-graphql/proto-graphql` is in your `buf.yaml` deps
2. Run `buf dep update`

### Generated file not found

If ts-proto generated files can't be found:

1. Verify `import_prefix` path is correct relative to pothos output
2. Ensure ts-proto runs before protoc-gen-pothos in buf.gen.yaml

### Builder not found

If the builder import fails:

1. Check `pothos_builder_path` is correct relative to generated files
2. Ensure the builder file exports `builder` as a named export
