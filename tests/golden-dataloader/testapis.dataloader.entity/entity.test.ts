import type { MessageInitShape } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { Code, ConnectError, createRouterTransport } from "@connectrpc/connect";
import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";
import {
  type BatchGetOrdersRequest,
  type BatchGetOrdersResponse,
  type BatchGetUsersInTenantRequest,
  type BatchGetUsersRequest,
  type BatchGetUsersResponse,
  type BatchGetUsersWithLocaleRequest,
  UserService,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/dataloader/entity/entity_pb";
import { describe, expect, test } from "vitest";
import {
  batchGetOrdersLoader,
  batchGetUsersInTenantLoader,
  batchGetUsersLoader,
  batchGetUsersWithLocaleLoader,
} from "./__generated__/testapis/dataloader/entity/entity.pb.dataloader.js";

type FakeUsersResponse = MessageInitShape<GenMessage<BatchGetUsersResponse>>;
type FakeOrdersResponse = MessageInitShape<GenMessage<BatchGetOrdersResponse>>;

interface UserServiceHandlers {
  batchGetUsers?: (req: BatchGetUsersRequest) => FakeUsersResponse;
  batchGetUsersWithLocale?: (
    req: BatchGetUsersWithLocaleRequest,
  ) => FakeUsersResponse;
  batchGetUsersInTenant?: (
    req: BatchGetUsersInTenantRequest,
  ) => FakeUsersResponse;
  batchGetOrders?: (req: BatchGetOrdersRequest) => FakeOrdersResponse;
}

interface UserServiceCalls {
  batchGetUsers: BatchGetUsersRequest[];
  batchGetUsersWithLocale: BatchGetUsersWithLocaleRequest[];
  batchGetUsersInTenant: BatchGetUsersInTenantRequest[];
  batchGetOrders: BatchGetOrdersRequest[];
}

function unexpectedCall(method: string): never {
  throw new Error(`unexpected call to UserService.${method} in this test`);
}

/**
 * Spins up a fake UserService over an in-memory Connect transport (design.md
 * §8-3), driving the *generated* `entity.pb.dataloader.ts` loaders rather
 * than hand-rolled `createRpcLoader` configs — proving the generated
 * `call`/`extractEntities`/`extractKey` closures are wired correctly, on top
 * of connect-runtime's own already-covered batching/caching semantics (see
 * packages/@proto-graphql/connect-runtime/src/rpcLoader.test.ts).
 */
function createFakeUserService(handlers: UserServiceHandlers) {
  const calls: UserServiceCalls = {
    batchGetUsers: [],
    batchGetUsersWithLocale: [],
    batchGetUsersInTenant: [],
    batchGetOrders: [],
  };
  const transport = createRouterTransport(({ service }) => {
    service(UserService, {
      async batchGetUsers(req) {
        calls.batchGetUsers.push(req);
        if (!handlers.batchGetUsers) unexpectedCall("batchGetUsers");
        return handlers.batchGetUsers(req);
      },
      async batchGetUsersWithLocale(req) {
        calls.batchGetUsersWithLocale.push(req);
        if (!handlers.batchGetUsersWithLocale) {
          unexpectedCall("batchGetUsersWithLocale");
        }
        return handlers.batchGetUsersWithLocale(req);
      },
      async batchGetUsersInTenant(req) {
        calls.batchGetUsersInTenant.push(req);
        if (!handlers.batchGetUsersInTenant) {
          unexpectedCall("batchGetUsersInTenant");
        }
        return handlers.batchGetUsersInTenant(req);
      },
      async batchGetOrders(req) {
        calls.batchGetOrders.push(req);
        if (!handlers.batchGetOrders) unexpectedCall("batchGetOrders");
        return handlers.batchGetOrders(req);
      },
    });
  });
  const ctx: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
  return { ctx, calls };
}

describe("batchGetUsersLoader (entity mode, no params, full inference)", () => {
  test("merges concurrent loads for the same ctx into a single call", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsers: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });

    await Promise.all([
      batchGetUsersLoader(ctx).load("1"),
      batchGetUsersLoader(ctx).load("2"),
    ]);

    expect(calls.batchGetUsers.length).toBe(1);
  });

  test("matches entities back to keys regardless of response order", async () => {
    const { ctx } = createFakeUserService({
      batchGetUsers: (req) => ({
        users: [...req.ids].reverse().map((id) => ({ id, name: `user-${id}` })),
      }),
    });

    const [u1, u2, u3] = await Promise.all([
      batchGetUsersLoader(ctx).load("1"),
      batchGetUsersLoader(ctx).load("2"),
      batchGetUsersLoader(ctx).load("3"),
    ]);

    expect(u1?.id).toBe("1");
    expect(u2?.id).toBe("2");
    expect(u3?.id).toBe("3");
  });

  test("resolves a missing key to null", async () => {
    const { ctx } = createFakeUserService({
      batchGetUsers: (req) => ({
        users: req.ids
          .filter((id) => id !== "2")
          .map((id) => ({ id, name: `user-${id}` })),
      }),
    });

    const [u1, u2] = await Promise.all([
      batchGetUsersLoader(ctx).load("1"),
      batchGetUsersLoader(ctx).load("2"),
    ]);

    expect(u1?.id).toBe("1");
    expect(u2).toBeNull();
  });

  test("last entity wins when the response contains duplicate keys", async () => {
    const { ctx } = createFakeUserService({
      batchGetUsers: () => ({
        users: [
          { id: "1", name: "first" },
          { id: "1", name: "second" },
        ],
      }),
    });

    const user = await batchGetUsersLoader(ctx).load("1");

    expect(user?.name).toBe("second");
  });

  test("ignores entities for keys that were not requested", async () => {
    const { ctx } = createFakeUserService({
      batchGetUsers: () => ({
        users: [
          { id: "1", name: "requested" },
          { id: "99", name: "not requested" },
        ],
      }),
    });

    const user = await batchGetUsersLoader(ctx).load("1");

    expect(user?.name).toBe("requested");
  });

  test("rejects every key in the batch when the RPC call throws", async () => {
    const { ctx } = createFakeUserService({
      batchGetUsers: () => {
        throw new ConnectError("boom", Code.Internal);
      },
    });

    const results = await Promise.allSettled([
      batchGetUsersLoader(ctx).load("1"),
      batchGetUsersLoader(ctx).load("2"),
    ]);

    expect(results[0].status).toBe("rejected");
    expect(results[1].status).toBe("rejected");
    expect(
      results[0].status === "rejected" && results[0].reason,
    ).toBeInstanceOf(ConnectError);
  });

  test("keeps separate batches per ctx, even when contexts share a transport", async () => {
    const { ctx: seedCtx, calls } = createFakeUserService({
      batchGetUsers: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });
    const transport = seedCtx.protoGraphql.transport;
    const ctxA: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
    const ctxB: ProtoGraphqlConnectContext = { protoGraphql: { transport } };

    await Promise.all([
      batchGetUsersLoader(ctxA).load("1"),
      batchGetUsersLoader(ctxB).load("1"),
    ]);

    expect(calls.batchGetUsers.length).toBe(2);
  });
});

describe("batchGetOrdersLoader (entity mode, bigint keys, max_batch_size: 2)", () => {
  test("splits 3 keys into 2 calls, and matches bigint keys back correctly", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetOrders: (req) => ({
        orders: req.ids.map((id) => ({ id, productName: `order-${id}` })),
      }),
    });

    const results = await Promise.all(
      [1n, 2n, 3n].map((id) => batchGetOrdersLoader(ctx).load(id)),
    );

    expect(results.map((o) => o?.id)).toEqual([1n, 2n, 3n]);
    expect(calls.batchGetOrders.length).toBe(2);
    expect(calls.batchGetOrders.flatMap((c) => c.ids)).toEqual([1n, 2n, 3n]);
  });
});

describe("batchGetUsersWithLocaleLoader (entity mode, optional params)", () => {
  // Params move from accessor time to load time (design.md §4.5): the
  // accessor is called once per ctx and returns a wrapper shared by every
  // `.load()` call, which resolves its own per-params DataLoader lazily.
  test("same params (by value) share a batch even from different object instances", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsersWithLocale: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });
    const loader = batchGetUsersWithLocaleLoader(ctx);

    await Promise.all([
      loader.load("1", { locale: "en" }),
      loader.load("2", { locale: "en" }),
    ]);

    expect(calls.batchGetUsersWithLocale.length).toBe(1);
  });

  test("different params split into separate batches", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsersWithLocale: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });
    const loader = batchGetUsersWithLocaleLoader(ctx);

    await Promise.all([
      loader.load("1", { locale: "en" }),
      loader.load("2", { locale: "ja" }),
    ]);

    expect(calls.batchGetUsersWithLocale.length).toBe(2);
  });

  test("omitted params, {}, and undefined all share the same batch", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsersWithLocale: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });
    const loader = batchGetUsersWithLocaleLoader(ctx);

    await Promise.all([
      loader.load("1"),
      loader.load("2", {}),
      loader.load("3", undefined),
    ]);

    expect(calls.batchGetUsersWithLocale.length).toBe(1);
  });

  test("same wrapper: distinct params in one tick issue separate RPC calls, while a same-value fresh params object merges into an existing batch", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsersWithLocale: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });
    const loader = batchGetUsersWithLocaleLoader(ctx);

    await Promise.all([
      loader.load("1", { locale: "en" }),
      loader.load("2", { locale: "en" }), // same value, fresh object -> merges with "1"
      loader.load("3", { locale: "ja" }), // distinct value -> separate batch
    ]);

    expect(calls.batchGetUsersWithLocale.length).toBe(2);
  });
});

describe("batchGetUsersInTenantLoader (entity mode, required params)", () => {
  // The type-level requirement (`params` has no `?`) is proven by the golden
  // typecheck (M2); this test proves the *value* actually reaches the wire.
  test("is called with params, which flow into the request", async () => {
    const { ctx, calls } = createFakeUserService({
      batchGetUsersInTenant: (req) => ({
        users: req.ids.map((id) => ({ id, name: `user-${id}` })),
      }),
    });

    const user = await batchGetUsersInTenantLoader(ctx).load("1", {
      tenantId: "acme",
    });

    expect(user?.id).toBe("1");
    expect(calls.batchGetUsersInTenant[0]?.tenantId).toBe("acme");
  });
});
