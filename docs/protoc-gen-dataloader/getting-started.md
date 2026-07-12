# Getting Started

> **EXPERIMENTAL.** Options and generated code shapes may change without notice. See the [README](./README.md).

This guide walks you through generating a DataLoader-based batch loader from a Connect RPC.

## Prerequisites

- Node.js (v18 or later recommended)
- [Buf CLI](https://buf.build/docs/installation)
- [`@bufbuild/protobuf`](https://github.com/bufbuild/protobuf-es) v2.x and [`@connectrpc/connect`](https://connectrpc.com/) (protoc-gen-dataloader only supports protobuf-es v2 — there is no `protobuf_lib` option)

## Installation

```bash
npm install protoc-gen-dataloader @proto-graphql/connect-runtime
# or
pnpm add protoc-gen-dataloader @proto-graphql/connect-runtime
```

You also need `@bufbuild/protoc-gen-es` (v2) to generate the protobuf-es message/service types that protoc-gen-dataloader's output imports:

```bash
npm install --save-dev @bufbuild/protoc-gen-es
```

## Project Setup

### 1. Create buf.yaml

```yaml
# proto/buf.yaml
version: v2
deps:
  - buf.build/proto-graphql/proto-graphql
```

### 2. Create buf.gen.yaml

Run protoc-gen-es (v2) to generate the message/service types, then protoc-gen-dataloader to generate the loaders:

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  # Generate protobuf-es v2 message + service types
  - local: protoc-gen-es
    out: ../src/__generated__/proto
    opt:
      - target=ts

  # Generate DataLoader batch loaders
  - local: protoc-gen-dataloader
    out: ../src/__generated__/dataloader
    opt:
      - import_prefix=../proto
```

### 3. Create Your Proto File

Annotate a unary BatchGet-style RPC with `(graphql.rpc).batch`:

```protobuf
// proto/example/user_service.proto
syntax = "proto3";

package example;

import "graphql/schema.proto";

message User {
  string id = 1;
  string name = 2;
}

message BatchGetUsersRequest {
  repeated string ids = 1;
}

message BatchGetUsersResponse {
  repeated User users = 1;
}

service UserService {
  // key_field ("ids") and entity_field ("users") are inferred here — no
  // explicit fields needed for those. entity_key must be set explicitly for
  // now (a `@key`-based fallback is planned once federation support lands
  // upstream). See the annotation reference for when inference fails.
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse) {
    option (graphql.rpc).batch = { entity_key: "id" };
  }
}
```

### 4. Generate Code

```bash
cd proto
buf dep update
buf generate
```

This produces `src/__generated__/dataloader/example/user_service.pb.dataloader.ts`, exporting `batchGetUsersLoader`.

## Wire Up the Context

Every generated loader accessor takes a context shaped like `ProtoGraphqlConnectContext` as its first argument — an object with a `protoGraphql.transport` (a Connect [`Transport`](https://connectrpc.com/docs/web/using-clients/#transports)):

```typescript
// src/context.ts
import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";
import { createConnectTransport } from "@connectrpc/connect-node";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8080",
});

export function createContext(): ProtoGraphqlConnectContext {
  return { protoGraphql: { transport } };
}
```

Your own context type does not need to extend `ProtoGraphqlConnectContext` — any object that is structurally shaped like it works (a `protoGraphql: { transport, ... }` property alongside whatever else your app's context carries).

For tests, swap in an in-memory transport with [`createRouterTransport`](https://connectrpc.com/docs/node/testing/) instead of hitting a real server:

```typescript
import { createRouterTransport } from "@connectrpc/connect";
import { UserService } from "./__generated__/proto/example/user_service_pb";

const transport = createRouterTransport(({ service }) => {
  service(UserService, {
    async batchGetUsers(req) {
      return { users: req.ids.map((id) => ({ id, name: `user-${id}` })) };
    },
  });
});
const ctx = { protoGraphql: { transport } };
```

## Use the Generated Loader

Import the loader accessor and call `.load(key)` (or `.loadMany(keys)`) with your context:

```typescript
import { batchGetUsersLoader } from "./__generated__/dataloader/example/user_service.pb.dataloader";

const user = await batchGetUsersLoader(ctx).load("user-1"); // User | null
const users = await batchGetUsersLoader(ctx).loadMany(["user-1", "user-2"]);
```

Concurrent `.load()` calls against the same `ctx` within a tick merge into a single `BatchGetUsers` RPC call, regardless of how many resolvers requested a key.

## Loader Params

If the RPC's request has fields besides the key list, the loader accessor takes a second `params` argument. Whether `params` is optional or required mirrors the field's presence in the request (see [Generated Code Reference](./generated-code-reference.md#params-variants)):

```protobuf
message BatchGetUsersWithLocaleRequest {
  repeated string ids = 1;
  optional string locale = 2; // optional => params stays optional
}
```

```typescript
// params omitted, {}, and undefined are all equivalent and share one batch
await batchGetUsersWithLocaleLoader(ctx).load("user-1");

// a distinct params value (by content) starts a separate batch
await batchGetUsersWithLocaleLoader(ctx, { locale: "ja" }).load("user-1");
```

Calling the same loader with varying params effectively splits it into one batch per distinct params value — see [Generated Code Reference](./generated-code-reference.md) for the full semantics.

## Next Steps

- [Configuration](./configuration.md) — every plugin parameter
- [Generated Code Reference](./generated-code-reference.md) — entity / group / params variants from real generated output
- [`(graphql.rpc).batch` annotation reference](../proto-annotations/reference.md) — inference rules and validation errors
