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

Builds a per-context-memoized `RpcLoader` accessor for a batch RPC: `(ctx) => RpcLoader`, where the `RpcLoader` wrapper resolves (creating on first sight) a per-params [DataLoader](https://github.com/graphql/dataloader) for `.load()`/`.loadMany()`/`.loader()`. This is the primitive `protoc-gen-dataloader` generates calls to — see that package's [Generated Code Reference](https://js.proto-graphql.dev/protoc-gen-dataloader/generated-code-reference) for the full generated shape, and its [Getting Started](https://js.proto-graphql.dev/protoc-gen-dataloader/getting-started) guide for an end-to-end walkthrough. Hand-writing a `createRpcLoader` config directly is also supported for RPCs outside of codegen:

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
// non-key request fields (if any) are passed at load/loadMany time, not accessor time:
// await batchGetUsersLoader(ctx).load("user-1", { view: "FULL" });
```

Behavior in brief (see the JSDoc on `createRpcLoader` for the full contract):

- `accessor(ctx)` is memoized per `ctx`, returning the same `RpcLoader` wrapper on every call.
- Concurrent `.load()`/`.loadMany()` calls for the same `ctx` (and the same params, by content) merge into a single RPC call.
- A missing key resolves to `null` (or `[]` when `group: true`); an RPC error rejects every key in that batch.
- `maxBatchSize` caps how many keys go into one RPC call; DataLoader splits the rest into further calls automatically.
- `.loader(...)` is an escape hatch to the raw per-params `DataLoader`, for `.prime()` / `.clear()` / `.clearAll()`.

## `callRpc` / `defaultConnectErrorHandler` (`@proto-graphql/connect-runtime/graphql`)

The root entry (above) never imports `graphql`, so that GraphQL-free consumers (e.g. `protoc-gen-dataloader`'s generated code) don't pull it in. `callRpc` and its error-conversion helper live on a separate subpath instead, for use by generated GraphQL resolvers:

```typescript
import { callRpc } from "@proto-graphql/connect-runtime/graphql";
import { getClient } from "@proto-graphql/connect-runtime";
import { UserService } from "./gen/user_service_pb";

const client = getClient(ctx, UserService);
const res = await callRpc(ctx, (opts) => client.getUser({ id: args.userId }, opts));
```

`callRpc` applies `ctx.protoGraphql.callOptions?.(ctx)` (defaulting to `{}`) and invokes `fn` with the result. If `fn` throws or rejects with an actual `ConnectError` (checked via `instanceof`, never coerced from an arbitrary error), the error is converted via `ctx.protoGraphql.errorHandler` — or `defaultConnectErrorHandler` when unset — and the conversion result is thrown instead. Any other error propagates unchanged.

`defaultConnectErrorHandler(err)` returns `new GraphQLError(err.rawMessage, { extensions: { code } })`, where `code` is the SCREAMING_SNAKE_CASE form of the Connect `Code` name (e.g. `Code.NotFound` -> `"NOT_FOUND"`). Error `details` are intentionally omitted to avoid leaking backend-internal information by default; pass a custom `errorHandler` via `ProtoGraphqlConnectContext` to include them.

## Author

- Masayuki Izumi ([github: @izumin5210](https://github.com/izumin5210))
