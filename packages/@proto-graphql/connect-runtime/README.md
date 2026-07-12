# @proto-graphql/connect-runtime

**EXPERIMENTAL.** This package is new and its API may change without notice — pin an exact version if you depend on it.

Runtime helpers shared by proto-graphql's [Connect](https://connectrpc.com/)-based code generators: a context convention for resolving RPC clients, and a [DataLoader](https://github.com/graphql/dataloader) factory for batch RPC calls. Currently consumed by [`protoc-gen-dataloader`](https://www.npmjs.com/package/protoc-gen-dataloader)'s generated code; a future `protoc-gen-pothos` federation integration and other generators are expected to depend on it too.

## Context Convention

Every helper in this package takes a `ProtoGraphqlConnectContext`-shaped object as its first argument. Your own context type does not need to extend it nominally — any object that is structurally shaped like this satisfies it:

```typescript
import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";
import { createConnectTransport } from "@connectrpc/connect-node";

const transport = createConnectTransport({ baseUrl: "http://localhost:8080" });

const ctx: ProtoGraphqlConnectContext = {
  protoGraphql: {
    transport, // default transport used when no per-service override matches
    // transports: new Map([["my.pkg.UserService", otherTransport]]), // optional per-service override
    // callOptions: (ctx) => ({ headers: ... }), // optional per-request CallOptions
  },
};
```

## `getClient`

Resolves (and memoizes) a Connect client for a service, using the transport configured on `ctx` — a per-service override from `protoGraphql.transports`, falling back to `protoGraphql.transport`. Clients are cached per transport instance, so every `ctx` sharing a transport reuses the same client:

```typescript
import { getClient } from "@proto-graphql/connect-runtime";
import { UserService } from "./gen/user_service_pb";

const client = getClient(ctx, UserService);
const res = await client.getUser({ id: "1" });
```

## `createRpcLoader`

Builds a per-context, per-params-memoized [DataLoader](https://github.com/graphql/dataloader) accessor for a batch RPC. This is the primitive `protoc-gen-dataloader` generates calls to — see that package's [Generated Code Reference](https://js.proto-graphql.dev/protoc-gen-dataloader/generated-code-reference) for the full generated shape, and its [Getting Started](https://js.proto-graphql.dev/protoc-gen-dataloader/getting-started) guide for an end-to-end walkthrough. Hand-writing a `createRpcLoader` config directly is also supported for RPCs outside of codegen:

```typescript
import { createRpcLoader } from "@proto-graphql/connect-runtime";
import { create } from "@bufbuild/protobuf";
import { BatchGetUsersRequestSchema, UserService } from "./gen/user_service_pb";

export const batchGetUsersLoader = createRpcLoader({
  service: UserService,
  method: "batchGetUsers",
  requestSchema: BatchGetUsersRequestSchema,
  call: (client, keys, params, opts) =>
    client.batchGetUsers(create(BatchGetUsersRequestSchema, { ...params, ids: [...keys] }), opts),
  extractEntities: (res) => res.users,
  extractKey: (user) => user.id,
});

const user = await batchGetUsersLoader(ctx).load("user-1"); // User | null
```

Behavior in brief (see the JSDoc on `createRpcLoader` for the full contract):

- Concurrent `.load()` calls for the same `ctx` (and the same `params`, by content) merge into a single RPC call.
- A missing key resolves to `null` (or `[]` when `group: true`); an RPC error rejects every key in that batch.
- `maxBatchSize` caps how many keys go into one RPC call; DataLoader splits the rest into further calls automatically.

## Author

- Masayuki Izumi ([github: @izumin5210](https://github.com/izumin5210))
