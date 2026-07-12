# proto-graphql Documentation

Generate GraphQL schema definitions from Protocol Buffer definitions.

## Documentation Index

### protoc-gen-pothos

- [Overview](./protoc-gen-pothos/README.md) - What the plugin generates
- [Getting Started](./protoc-gen-pothos/getting-started.md) - Quick start guide for new users
- [Configuration](./protoc-gen-pothos/configuration.md) - Complete options reference
- [Buf Setup](./protoc-gen-pothos/buf-setup.md) - Configuration with Buf
- [Generated Code Reference](./protoc-gen-pothos/generated-code-reference/README.md) - Detailed generated code examples

### protoc-gen-dataloader (EXPERIMENTAL)

- [Overview](./protoc-gen-dataloader/README.md) - What the plugin generates
- [Getting Started](./protoc-gen-dataloader/getting-started.md) - Quick start guide for new users
- [Configuration](./protoc-gen-dataloader/configuration.md) - Complete options reference
- [Generated Code Reference](./protoc-gen-dataloader/generated-code-reference.md) - Detailed generated code examples

### Type Mapping Rules

- [Overview](./type-mapping/README.md) - How Protobuf types map to GraphQL
- [Messages](./type-mapping/messages.md) - ObjectType, InputType, Interface, Union
- [Fields](./type-mapping/fields.md) - Field behaviors and nullability
- [Scalars](./type-mapping/scalars.md) - Scalar type mappings
- [Enums](./type-mapping/enums.md) - Enum conversion rules
- [Oneofs](./type-mapping/oneofs.md) - Oneof and union types

### Reference

- [Proto Annotations](./proto-annotations/reference.md) - Complete proto options reference

### Design Docs (internal)

- [gRPC Service → GraphQL Operations + Federation Subgraph](./design/grpc-service-to-graphql/README.md)
- [protoc-gen-dataloader](./design/protoc-gen-dataloader/design.md)

## External Resources

- [GitHub Repository](https://github.com/proto-graphql/proto-graphql-js)
- [Pothos GraphQL](https://pothos-graphql.dev/)
- [Buf](https://buf.build/)
