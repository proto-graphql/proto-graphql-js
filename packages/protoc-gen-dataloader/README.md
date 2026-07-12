# protoc-gen-dataloader

**EXPERIMENTAL.** Options and generated code shapes may change without notice — pin an exact version if you depend on this package.

A protoc plugin that generates [DataLoader](https://github.com/graphql/dataloader)-based batch loaders from BatchGet-style [Connect](https://connectrpc.com/) RPCs annotated with `(graphql.rpc).batch`. Generated code depends only on Connect-ES, protobuf-es v2, and `dataloader` — it has no dependency on GraphQL or Pothos.

## Documentation

- [Overview](./docs/README.md) - what it generates, loader modes, use cases
- [Getting Started](./docs/getting-started.md) - buf setup, proto annotation, first loader call
- [Configuration](./docs/configuration.md) - plugin parameter reference
- [Generated Code Reference](./docs/generated-code-reference.md) - real generated output, key-matching semantics

Also published at [js.proto-graphql.dev/protoc-gen-dataloader](https://js.proto-graphql.dev/protoc-gen-dataloader).

## Runtime

Generated code imports [`@proto-graphql/connect-runtime`](https://www.npmjs.com/package/@proto-graphql/connect-runtime) (`createRpcLoader`, `ProtoGraphqlConnectContext`) at runtime — install it alongside this plugin.

## Author

- Masayuki Izumi ([github: @izumin5210](https://github.com/izumin5210))
