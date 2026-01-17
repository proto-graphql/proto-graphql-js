# proto-graphql Documentation

Generate GraphQL schema definitions from Protocol Buffer definitions.

## Documentation Index

### Getting Started

- [Getting Started](./getting-started.md) - Quick start guide for new users

### protoc-gen-pothos

- [Overview](./protoc-gen-pothos/README.md) - What the plugin generates
- [Configuration](./protoc-gen-pothos/configuration.md) - Complete options reference
- [Buf Setup](./protoc-gen-pothos/buf-setup.md) - Configuration with Buf

### Type Mapping Rules

- [Overview](./type-mapping/README.md) - How Protobuf types map to GraphQL
- [Messages](./type-mapping/messages.md) - ObjectType, InputType, Interface, Union
- [Fields](./type-mapping/fields.md) - Field behaviors and nullability
- [Scalars](./type-mapping/scalars.md) - Scalar type mappings
- [Enums](./type-mapping/enums.md) - Enum conversion rules
- [Oneofs](./type-mapping/oneofs.md) - Oneof and union types

### Reference

- [Proto Annotations](./proto-annotations/reference.md) - Complete proto options reference

## Quick Links

| Goal | Document |
|------|----------|
| Set up a new project | [Getting Started](./getting-started.md) |
| Configure plugin options | [Configuration](./protoc-gen-pothos/configuration.md) |
| Customize scalar mappings | [Scalars](./type-mapping/scalars.md) |
| Control field nullability | [Fields](./type-mapping/fields.md) |
| Create union types | [Oneofs](./type-mapping/oneofs.md) |
| All proto annotations | [Proto Annotations](./proto-annotations/reference.md) |

## External Resources

- [GitHub Repository](https://github.com/proto-graphql/proto-graphql-js)
- [Pothos GraphQL](https://pothos-graphql.dev/)
- [Buf](https://buf.build/)
