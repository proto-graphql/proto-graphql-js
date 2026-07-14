# RPC Operations

> **EXPERIMENTAL.** This feature, its proto options, and the shape of its generated code are under active development and may change without notice in any release. Pin an exact version if you depend on it.

protoc-gen-pothos can generate `Query`/`Mutation` fields — including full resolver implementations that call a [Connect](https://connectrpc.com/) RPC — directly from a proto `service` definition. You annotate each RPC you want exposed, and the plugin emits the field, its arguments, and a resolver that assembles the request, calls the RPC, and maps the response (or a thrown error) back into GraphQL.

**Requires `protobuf_lib=protobuf-es`** (protobuf-es v2 / Connect-ES v2). Using `(graphql.rpc).operation` with `protobuf_lib=ts-proto` or `protobuf_lib=protobuf-es-v1` is a codegen error:

```
<file>: (graphql.rpc).operation requires protobuf_lib=protobuf-es (protobuf-es v2), but protobuf_lib=<value>. RPC-to-Query/Mutation generation only supports protobuf-es v2 (Connect-ES v2). Remove (graphql.rpc).operation from the file's RPCs, or switch the plugin to protobuf_lib=protobuf-es.
```

## Opting In

An RPC generates a `Query`/`Mutation` field **iff `(graphql.rpc).operation` is explicitly set to `QUERY` or `MUTATION`**. There is no service-level opt-in, and `idempotency_level` is never consulted — an RPC with no `operation` set is silently not exposed, no matter what else is true about it. This keeps the feature fully additive: existing users who never set `operation` see no change in output.

```protobuf
import "graphql/schema.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (User) {
    option (graphql.rpc).operation = QUERY;
  }
}

// No RPC here sets `(graphql.rpc).operation`: no Query/Mutation field is
// generated for GetAdmin, even though the RPC itself would otherwise
// resolve just fine.
service AdminService {
  rpc GetAdmin(GetUserRequest) returns (User);
}
```

`(graphql.rpc).ignore = true` disables generation for an RPC while keeping its `operation` declaration in place — useful for temporarily halting generation without losing the annotation:

```protobuf
service UserService {
  // `operation` is set, but `ignore = true` wins: not generated.
  rpc InternalSync(InternalSyncRequest) returns (google.protobuf.Empty) {
    option (graphql.rpc).operation = MUTATION;
    option (graphql.rpc).ignore = true;
  }
}
```

> **Future direction.** `operation` is currently the single declaration point for exposing an RPC. A later addition may introduce a field-targeting kind (e.g. an `extend`-style annotation for federation) alongside `QUERY`/`MUTATION` — this is not implemented yet.

## Query vs. Mutation

The operation kind is simply whichever of `QUERY` or `MUTATION` you set on `(graphql.rpc).operation` — there is no inference from `idempotency_level` or the RPC name (no `Get*` → Query heuristic), so an RPC like `GetOrCreateSession` cannot be misclassified.

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User) {
    option (graphql.rpc).operation = QUERY;
  }

  rpc CreateUser(CreateUserRequest) returns (User) {
    option (graphql.rpc).operation = MUTATION;
  }
}
```

## Field Naming

The default field name is the camelCase form of the RPC name (`GetUser` → `getUser`). Override it with `(graphql.rpc).name`:

```protobuf
// (graphql.rpc).name overrides the default camelCase field name.
rpc RenameUser(RenameUserRequest) returns (User) {
  option (graphql.rpc).name = "updateUserName";
}
```

```graphql
type Mutation {
  updateUserName(input: RenameUserRequestInput!): User!
}
```

## Arguments: Query Flatten vs. Mutation Single Input

- **Query**: the request message's fields are flattened into individual GraphQL arguments, reusing the same rules as `Input` type field generation (nullability, message fields referencing the field's `Input` type, oneof members flattened as individual optional arguments).
- **Mutation**: a single `input: XxxInput!` argument referencing the request message's `Input` type.

```protobuf
// Flattened Query args covering a scalar, an optional scalar, an enum, a
// message, and a message-typed oneof.
rpc SearchUsers(SearchUsersRequest) returns (SearchUsersResponse) {
  option (graphql.rpc).operation = QUERY;
  option (graphql.rpc).expose_field = "users";
}

// Explicit operation = MUTATION. Single `input` arg.
rpc CreateUser(CreateUserRequest) returns (User) {
  option (graphql.rpc).operation = MUTATION;
}
```

```graphql
type Query {
  searchUsers(address: AddressInput, home: AddressInput, limit: Int, queryText: String!, role: Role, work: WorkAddressInput): [User!]
}

type Mutation {
  createUser(input: CreateUserRequestInput!): User!
}
```

Generated resolvers (from [`tests/golden/protobuf-es/testapis.service.basic`](../../tests/golden/protobuf-es/testapis.service.basic/__expected__/testapis/service/basic/basic.pb.pothos.ts)):

```typescript
builder.queryField("searchUsers", (t) =>
  t.field({
    type: [User$Ref],
    nullable: { list: true, items: false },
    args: {
      queryText: t.arg({ type: "String", required: true }),
      limit: t.arg({ type: "Int", required: false }),
      role: t.arg({ type: Role$Ref, required: false }),
      address: t.arg({ type: AddressInput$Ref, required: false }),
      home: t.arg({ type: AddressInput$Ref, required: false }),
      work: t.arg({ type: WorkAddressInput$Ref, required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const client = getClient(ctx, UserService);
      const res = await callRpc(ctx, (opts) =>
        client.searchUsers(
          create(SearchUsersRequestSchema, {
            queryText: args.queryText ?? undefined,
            limit: args.limit ?? undefined,
            role: args.role ?? undefined,
            address: args.address ? AddressInput$toProto(args.address) : undefined,
            filter: args.home
              ? { case: "home", value: AddressInput$toProto(args.home) }
              : args.work
              ? { case: "work", value: WorkAddressInput$toProto(args.work) }
              : undefined,
          }),
          opts,
        ));
      return res.users;
    },
    // ...
  }),
);

builder.mutationField("createUser", (t) =>
  t.field({
    type: User$Ref,
    nullable: false,
    args: { input: t.arg({ type: CreateUserRequestInput$Ref, required: true }) },
    resolve: async (_root, args, ctx) => {
      const client = getClient(ctx, UserService);
      const res = await callRpc(
        ctx,
        (opts) => client.createUser(CreateUserRequestInput$toProto(args.input), opts),
      );
      return res;
    },
    // ...
  }),
);
```

`v1` intentionally emits **no runtime XOR validation** for mutually-exclusive oneof members in flattened Query arguments — passing more than one is not rejected by generated code (it is the same "flatten" behavior as ordinary Input types).

## Return Type

By default, the return type is the response message's GraphQL Object type (renamed to `XxxPayload` if `responses_as_payloads` applies), and it is **non-null**: the RPC either returns a value or the call throws (mapped to a `GraphQLError`, see [Error Mapping](#error-mapping)) — there is no `null` return for "not found".

### `expose_field`

Set `(graphql.rpc).expose_field` to unwrap a single response field and return it directly, instead of the whole response message:

```protobuf
rpc SearchUsers(SearchUsersRequest) returns (SearchUsersResponse) {
  option (graphql.rpc).operation = QUERY;
  option (graphql.rpc).expose_field = "users";
}
```

```protobuf
message SearchUsersResponse {
  repeated User users = 1;
}
```

```graphql
type Query {
  searchUsers(...): [User!]
}
```

The returned field's own output nullability rules apply (here, `repeated User users` → nullable list of non-null items). There is no automatic single-field unwrap: without `expose_field`, `SearchUsersResponse` itself would be the return type. This is intentional — auto-unwrapping would make adding a field to the response message an implicit breaking change to the GraphQL schema.

### `google.protobuf.Empty`

A request of `google.protobuf.Empty` means the field takes **zero arguments**, for both Query and Mutation. A response of `google.protobuf.Empty` maps to a non-null `Boolean`, whose generated resolver always returns `true` (the RPC call's own success/failure already becomes the field succeeding or throwing):

```protobuf
// Explicit operation = QUERY. google.protobuf.Empty response -> non-null
// Boolean, always true.
rpc PingUser(GetUserRequest) returns (google.protobuf.Empty) {
  option (graphql.rpc).operation = QUERY;
}

// Explicit operation = MUTATION; google.protobuf.Empty response -> Boolean.
rpc DeleteUser(GetUserRequest) returns (google.protobuf.Empty) {
  option (graphql.rpc).operation = MUTATION;
}
```

```graphql
type Query {
  pingUser(userId: String!): Boolean!
}

type Mutation {
  deleteUser(input: GetUserRequestInput!): Boolean!
}
```

```typescript
builder.queryField("pingUser", (t) =>
  t.field({
    type: "Boolean",
    nullable: false,
    args: { userId: t.arg({ type: "String", required: true }) },
    resolve: async (_root, args, ctx) => {
      const client = getClient(ctx, UserService);
      await callRpc(ctx, (opts) =>
        client.pingUser(create(GetUserRequestSchema, { userId: args.userId ?? undefined }), opts));
      return true;
    },
    // ...
  }),
);
```

## Streaming RPCs Are Skipped

Server-, client-, and bidi-streaming RPCs have no single request/response pair to map to a GraphQL field. Like any other unannotated RPC, one with no explicit `operation` is simply not exposed — silently, with no warning:

```protobuf
// Server-streaming RPC with no explicit `operation` -> simply unexposed.
rpc WatchUsers(GetUserRequest) returns (stream User);
```

If a streaming RPC sets an explicit `(graphql.rpc).operation`, that is a codegen **error** instead (it asks for a mapping that cannot exist):

```
(graphql.rpc).operation is set on UserService.WatchUsers, but UserService.WatchUsers is a server_streaming RPC. Streaming RPCs cannot be mapped to a GraphQL Query/Mutation. Remove the operation option, or set (graphql.rpc).ignore = true to exclude this RPC.
```

Subscriptions (streaming → GraphQL Subscription) are out of scope for this feature.

## `requests_as_inputs` / `responses_as_payloads`

These file-level `(graphql.schema)` options (see [Proto Annotations Reference](../proto-annotations/reference.md)) rename matched `XxxRequest`/`XxxResponse` messages to `XxxInput`/`XxxPayload` and generate only the corresponding side (Input-only / Object-only), instead of the default Object+Input pair — the Relay-style "input/payload" convention for mutations:

```protobuf
option (graphql.schema) = {
  requests_as_inputs: true
  responses_as_payloads: true
};

service TaskService {
  // Single `input` arg referencing `CreateTaskInput` (the transformed
  // `CreateTaskRequest`); returns `CreateTaskPayload` (the transformed
  // `CreateTaskResponse`).
  rpc CreateTask(CreateTaskRequest) returns (CreateTaskResponse) {
    option (graphql.rpc).operation = MUTATION;
  }
}

message CreateTaskRequest {
  string title = 1;
}

message CreateTaskResponse {
  Task task = 1;
}
```

```graphql
input CreateTaskInput {
  title: String!
}

type CreateTaskPayload {
  task: Task
}

type Mutation {
  createTask(input: CreateTaskInput!): CreateTaskPayload!
}
```

Note that `CreateTaskRequest`/`CreateTaskResponse` no longer generate an Object type / Input type respectively — only `CreateTaskInput` (Input) and `CreateTaskPayload` (Object) exist in the schema. This is a file-wide transform: it applies to every matched message in the file, not just RPC request/response messages, though RPC operations are usually the reason to enable it.

## Builder Requirements

Your Pothos builder must register both root types, even if you have no other Query/Mutation fields of your own — otherwise `builder.queryField`/`builder.mutationField` in the generated code have nothing to attach to:

```typescript
builder.queryType({});
builder.mutationType({});
```

Your GraphQL context type must structurally satisfy `ProtoGraphqlConnectContext` from `@proto-graphql/connect-runtime` — generated resolvers call `getClient(ctx, Service)` and `callRpc(ctx, ...)`, which only require a `protoGraphql.transport`:

```typescript
import type { CallOptions, ConnectError, Transport } from "@connectrpc/connect";
import SchemaBuilder from "@pothos/core";

export interface Context {
  protoGraphql: {
    transport: Transport;
    transports?: Map<string, Transport>;       // optional per-service override
    callOptions?: (ctx: unknown) => CallOptions; // optional per-request headers etc.
    errorHandler?: (err: ConnectError) => Error; // optional error-conversion override
  };
}

export const builder = new SchemaBuilder<{ Context: Context }>({});

builder.queryType({});
builder.mutationType({});
```

Generated `*.pb.pothos.ts` files call `builder.queryField`/`builder.mutationField` as a **side effect** at import time — as with other generated types, make sure the file is imported (directly or transitively) before `builder.toSchema()` runs:

```typescript
import { builder } from "./builder.js";
// Side-effect import: registers this file's builder.queryField/
// builder.mutationField calls.
import "./__generated__/testapis/service/basic/basic.pb.pothos.js";

export const schema = builder.toSchema();
```

## Runtime Wiring

Generated resolvers resolve an RPC client via `getClient(ctx, Service)` and invoke it through `callRpc(ctx, fn)`, both from `@proto-graphql/connect-runtime` (see its [README](https://github.com/proto-graphql/proto-graphql-js/blob/main/packages/%40proto-graphql/connect-runtime/README.md) for the full API). In production, provide a real Connect `Transport`:

```typescript
import { createConnectTransport } from "@connectrpc/connect-node";
import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";

const transport = createConnectTransport({ baseUrl: "http://localhost:8080" });

function createContext(): Context {
  return {
    protoGraphql: {
      transport,
      // callOptions: (ctx) => ({ headers: { authorization: `Bearer ${token}` } }),
    },
  };
}
```

In tests, swap in an in-process transport with [`createRouterTransport`](https://connectrpc.com/docs/node/testing/) instead of hitting a real server — this is how this feature's own execution tests drive the generated resolvers end to end:

```typescript
import { createRouterTransport } from "@connectrpc/connect";
import { UserService } from "./__generated__/testapis/service/basic/basic_pb";

const transport = createRouterTransport(({ service }) => {
  service(UserService, {
    async getUser(req) {
      return { id: req.userId, name: `user-${req.userId}` };
    },
  });
});
const contextValue: Context = { protoGraphql: { transport } };
```

`callOptions` (if set) is applied on every call, letting you forward headers or deadlines per-request. `transports` lets you route different services to different transports when they live behind different backends.

## Error Mapping

If the resolver's RPC call throws or rejects with a `ConnectError`, it is converted to a `GraphQLError` (rather than propagating the raw `ConnectError`) via `defaultConnectErrorHandler`, or a custom `errorHandler` set on `ctx.protoGraphql`:

```typescript
new GraphQLError(err.rawMessage, { extensions: { code } })
```

`code` is the SCREAMING_SNAKE_CASE form of the Connect `Code` name — e.g. `Code.NotFound` → `"NOT_FOUND"`, `Code.InvalidArgument` → `"INVALID_ARGUMENT"`. `details` are intentionally omitted by default to avoid leaking backend-internal information; pass a custom `errorHandler` via `ProtoGraphqlConnectContext` to include them. Any error that is not a `ConnectError` (checked via `instanceof`) propagates unchanged.

Because the return type is non-null by default, an error on a non-null field with no nullable ancestor nulls the entire `data` response, per the GraphQL spec's error-handling rules for non-nullable fields.

## See Also

- [Proto Annotations Reference](../proto-annotations/reference.md) — full `(graphql.rpc)` field reference
- [Configuration](./configuration.md) — the `runtime_module` plugin parameter
- [`@proto-graphql/connect-runtime` README](https://github.com/proto-graphql/proto-graphql-js/blob/main/packages/%40proto-graphql/connect-runtime/README.md) — `getClient` / `callRpc` / context convention in full
- [Design Doc](../design/grpc-service-to-graphql/README.md) — the full design and decision log behind this feature
