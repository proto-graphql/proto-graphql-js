# protoc-gen-dataloader

> **EXPERIMENTAL.** This plugin, its plugin options, and the shape of its generated code are under active development and may change without notice in any release. Pin an exact version if you depend on it.

A protoc plugin that generates [DataLoader](https://github.com/graphql/dataloader)-based batch loaders from BatchGet-style [Connect](https://connectrpc.com/) RPCs.

## What It Generates

For each `.proto` file that has at least one RPC annotated with `(graphql.rpc).batch`, the plugin generates a `.pb.dataloader.ts` file containing one loader accessor per annotated RPC.

Generated code depends only on [Connect-ES](https://connectrpc.com/docs/web/getting-started), [protobuf-es](https://github.com/bufbuild/protobuf-es) v2, and `@proto-graphql/connect-runtime` (which itself wraps [`dataloader`](https://github.com/graphql/dataloader)) — **it has no dependency on GraphQL or Pothos**. Declaring `(graphql.rpc).batch` is independent of `(graphql.rpc)`'s other options: a loader is generated purely from the `batch` annotation, whether or not the RPC is ever exposed as a GraphQL field via `(graphql.rpc).operation`.

```protobuf
import "graphql/schema.proto";

service UserService {
  // ids -> User (1:1)
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse) {
    option (graphql.rpc).batch = { entity_key: "id" };
  }
}
```

```typescript
// user_service.pb.dataloader.ts
export const batchGetUsersLoader: (
  ctx: ProtoGraphqlConnectContext,
) => RpcLoader<string, MessageShape<typeof UserSchema> | null> = createRpcLoader({ /* ... */ });

// usage
const user = await batchGetUsersLoader(ctx).load("user-1"); // User | null
```

See [Getting Started](./getting-started.md) for the full setup, and the [`(graphql.rpc).batch` reference](../proto-annotations/reference.md) for every field, inference rule, and validation error.

## Loader Modes

| Mode | Declaration | Generated type | Missing key resolves to | Typical use |
|---|---|---|---|---|
| **entity** | `batch: {}` | `RpcLoader<K, Entity \| null>` | `null` | BatchGet RPC (1 key → at most 1 entity). Federation `resolveReference`. |
| **group** | `batch: { group: true }` | `RpcLoader<K, Entity[]>` | `[]` | 1 key → N entities (e.g. `userId` → `Review[]`). Relation / `extend` fields. |

## Use Cases

| Use case | Status |
|---|---|
| Standalone / BFF: N+1-safe batching of RPC calls from hand-written resolvers, route handlers, or other server-side code | **Works today** — import the generated loader directly |
| Federation entity resolution (`resolveReference`) and `extend` field resolvers | Coming later. `protoc-gen-pothos`'s federation output will import these loaders once it lands (see the [design doc](../design/protoc-gen-dataloader/design.md), §1) |
| `protoc-gen-gqlkit` resolver generation | Planned, not started |

## Documentation

- [Getting Started](./getting-started.md) — buf setup, proto annotation, context wiring, first loader call
- [Configuration](./configuration.md) — plugin parameter reference
- [Generated Code Reference](./generated-code-reference.md) — entity / group / params variants, with real generated output
- [`(graphql.rpc).batch` annotation reference](../proto-annotations/reference.md) — fields, inference rules, validation errors
