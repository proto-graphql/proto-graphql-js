import { create, type MessageInitShape } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { Code, ConnectError, createRouterTransport } from "@connectrpc/connect";
import {
  type BatchGetPostsRequest,
  BatchGetPostsRequestSchema,
  type BatchGetPostsResponse,
  CreatePostRequestSchema,
  type PostResponse,
  PostResponseSchema,
  PostsService,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/options/schema/schema_pb";
import { describe, expect, test } from "vitest";
import type { ProtoGraphqlConnectContext } from "./context.js";
import { createRpcLoader } from "./rpcLoader.js";

type FakeBatchGetPostsResponse = MessageInitShape<
  GenMessage<BatchGetPostsResponse>
>;

function createFakePostsService(
  handler: (
    req: BatchGetPostsRequest,
  ) => FakeBatchGetPostsResponse | Promise<FakeBatchGetPostsResponse>,
) {
  const calls: BatchGetPostsRequest[] = [];
  const transport = createRouterTransport(({ service }) => {
    service(PostsService, {
      async batchGetPosts(req) {
        calls.push(req);
        return handler(req);
      },
    });
  });
  const ctx: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
  return { ctx, calls };
}

// Reused across tests: mirrors the loader generated code would produce for
// `option (graphql.rpc).batch = {}` on `BatchGetPosts` (entity mode, no
// non-key params). A fresh `ctx` per test keeps the loader's per-context
// cache from leaking between tests.
const batchGetPostsLoader = createRpcLoader({
  service: PostsService,
  method: "batchGetPosts",
  requestSchema: BatchGetPostsRequestSchema,
  call: (client, keys, params, opts) =>
    client.batchGetPosts(
      create(BatchGetPostsRequestSchema, { ...params, id: [...keys] }),
      opts,
    ),
  extractEntities: (res) => res.posts,
  extractKey: (post: PostResponse) => post.id,
});

// NOTE: CreatePostRequestSchema/PostResponseSchema are reused purely as a
// vehicle for a `body: string` / `id: bigint` params field — createRpcLoader
// only ever uses `requestSchema` to compute the params cache key, so it does
// not need to match the request `call` actually sends over the wire. Module
// scope (not just the "params handling" describe below) so the "accessor"
// describe block can also build a params-carrying wrapper.
function createStringParamsLoader() {
  return createRpcLoader({
    service: PostsService,
    method: "batchGetPosts",
    requestSchema: CreatePostRequestSchema,
    call: (client, keys, _params, opts) =>
      client.batchGetPosts(
        create(BatchGetPostsRequestSchema, { id: [...keys] }),
        opts,
      ),
    extractEntities: (res) => res.posts,
    extractKey: (post: PostResponse) => post.id,
  });
}

function createBigintParamsLoader() {
  return createRpcLoader({
    service: PostsService,
    method: "batchGetPosts",
    requestSchema: PostResponseSchema,
    call: (client, keys, _params, opts) =>
      client.batchGetPosts(
        create(BatchGetPostsRequestSchema, { id: [...keys] }),
        opts,
      ),
    extractEntities: (res) => res.posts,
    extractKey: (post: PostResponse) => post.id,
  });
}

describe("createRpcLoader (entity mode)", () => {
  test("matches entities back to keys regardless of response order", async () => {
    const { ctx } = createFakePostsService((req) => ({
      posts: [...req.id].reverse().map((id) => ({ id, body: `post-${id}` })),
    }));

    const [p1, p2, p3] = await Promise.all([
      batchGetPostsLoader(ctx).load(1n),
      batchGetPostsLoader(ctx).load(2n),
      batchGetPostsLoader(ctx).load(3n),
    ]);

    expect(p1?.id).toBe(1n);
    expect(p2?.id).toBe(2n);
    expect(p3?.id).toBe(3n);
  });

  test("resolves a missing key to null", async () => {
    const { ctx } = createFakePostsService((req) => ({
      posts: req.id
        .filter((id) => id !== 2n)
        .map((id) => ({ id, body: `post-${id}` })),
    }));

    const [p1, p2] = await Promise.all([
      batchGetPostsLoader(ctx).load(1n),
      batchGetPostsLoader(ctx).load(2n),
    ]);

    expect(p1?.id).toBe(1n);
    expect(p2).toBeNull();
  });

  test("last entity wins when the response contains duplicate keys", async () => {
    const { ctx } = createFakePostsService(() => ({
      posts: [
        { id: 1n, body: "first" },
        { id: 1n, body: "second" },
      ],
    }));

    const post = await batchGetPostsLoader(ctx).load(1n);

    expect(post?.body).toBe("second");
  });

  test("requesting the same key twice concurrently still resolves correctly, via a single call", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));

    const [a, b] = await Promise.all([
      batchGetPostsLoader(ctx).load(1n),
      batchGetPostsLoader(ctx).load(1n),
    ]);

    expect(a?.id).toBe(1n);
    expect(b?.id).toBe(1n);
    expect(calls.length).toBe(1);
  });

  test("ignores entities for keys that were not requested", async () => {
    const { ctx } = createFakePostsService(() => ({
      posts: [
        { id: 1n, body: "requested" },
        { id: 99n, body: "not requested" },
      ],
    }));

    const post = await batchGetPostsLoader(ctx).load(1n);

    expect(post?.body).toBe("requested");
  });

  test("rejects every key in the batch when the RPC call throws", async () => {
    const { ctx } = createFakePostsService(() => {
      throw new ConnectError("boom", Code.Internal);
    });

    const results = await Promise.allSettled([
      batchGetPostsLoader(ctx).load(1n),
      batchGetPostsLoader(ctx).load(2n),
    ]);

    expect(results[0].status).toBe("rejected");
    expect(results[1].status).toBe("rejected");
    expect(
      results[0].status === "rejected" && results[0].reason,
    ).toBeInstanceOf(ConnectError);
  });

  test("splits a batch across multiple calls once maxBatchSize is exceeded", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const loader = createRpcLoader({
      service: PostsService,
      method: "batchGetPosts",
      requestSchema: BatchGetPostsRequestSchema,
      maxBatchSize: 2,
      call: (client, keys, params, opts) =>
        client.batchGetPosts(
          create(BatchGetPostsRequestSchema, { ...params, id: [...keys] }),
          opts,
        ),
      extractEntities: (res) => res.posts,
      extractKey: (post: PostResponse) => post.id,
    });

    const results = await Promise.all(
      [1n, 2n, 3n].map((id) => loader(ctx).load(id)),
    );

    expect(results.map((p) => p?.id)).toEqual([1n, 2n, 3n]);
    expect(calls.length).toBe(2);
    expect(calls.flatMap((c) => c.id)).toEqual([1n, 2n, 3n]);
  });

  test("merges concurrent loads for the same ctx into a single call", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));

    await Promise.all([
      batchGetPostsLoader(ctx).load(1n),
      batchGetPostsLoader(ctx).load(2n),
    ]);

    expect(calls.length).toBe(1);
  });

  test("keeps separate batches per ctx, even when contexts share a transport", async () => {
    const { ctx: seedCtx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const transport = seedCtx.protoGraphql.transport;
    const ctxA: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
    const ctxB: ProtoGraphqlConnectContext = { protoGraphql: { transport } };

    await Promise.all([
      batchGetPostsLoader(ctxA).load(1n),
      batchGetPostsLoader(ctxB).load(1n),
    ]);

    expect(calls.length).toBe(2);
  });
});

describe("createRpcLoader (group mode)", () => {
  const groupLoader = createRpcLoader({
    service: PostsService,
    method: "batchGetPosts",
    requestSchema: BatchGetPostsRequestSchema,
    group: true,
    call: (client, keys, params, opts) =>
      client.batchGetPosts(
        create(BatchGetPostsRequestSchema, { ...params, id: [...keys] }),
        opts,
      ),
    extractEntities: (res) => res.posts,
    // PostsService has no natural 1:N relation, so this test fixture reuses
    // `id` as the group key and has the fake server below return several
    // posts sharing the same id to simulate "1 key -> N entities".
    extractKey: (post: PostResponse) => post.id,
  });

  test("groups multiple entities under the same key", async () => {
    const { ctx } = createFakePostsService((req) => ({
      posts: req.id.flatMap((id) => {
        if (id === 1n) {
          return [
            { id, body: "a" },
            { id, body: "b" },
            { id, body: "c" },
          ];
        }
        if (id === 2n) {
          return [{ id, body: "solo" }];
        }
        return [];
      }),
    }));

    const [group1, group2, group3] = await Promise.all([
      groupLoader(ctx).load(1n),
      groupLoader(ctx).load(2n),
      groupLoader(ctx).load(3n),
    ]);

    expect(group1.map((p) => p.body)).toEqual(["a", "b", "c"]);
    expect(group2.map((p) => p.body)).toEqual(["solo"]);
    expect(group3).toEqual([]);
  });

  test("resolves a missing key to an empty array", async () => {
    const { ctx } = createFakePostsService(() => ({ posts: [] }));

    const group = await groupLoader(ctx).load(1n);

    expect(group).toEqual([]);
  });
});

describe("createRpcLoader accessor (ctx -> RpcLoader wrapper)", () => {
  test("memoizes the wrapper per ctx: repeated accessor calls return the same instance", async () => {
    const { ctx } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));

    expect(batchGetPostsLoader(ctx)).toBe(batchGetPostsLoader(ctx));
  });

  test("loader() resolves the same DataLoader instance load() uses, so prime() pre-fills what load() sees", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = batchGetPostsLoader(ctx);

    wrapper
      .loader()
      .prime(1n, create(PostResponseSchema, { id: 1n, body: "primed" }));
    const post = await wrapper.load(1n);

    expect(post?.body).toBe("primed");
    expect(calls.length).toBe(0);
  });

  test("loader(params) resolves the same DataLoader instance load(key, params) uses, keyed by that params value", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createStringParamsLoader()(ctx);

    wrapper
      .loader({ body: "shared" })
      .prime(1n, create(PostResponseSchema, { id: 1n, body: "primed" }));
    const primed = await wrapper.load(1n, { body: "shared" });
    // A different params value is a different DataLoader (design.md §4.3-1)
    // — prime() above must not leak into it.
    const notPrimed = await wrapper.load(2n, { body: "other" });

    expect(primed?.body).toBe("primed");
    expect(notPrimed?.body).toBe("post-2");
    expect(calls.length).toBe(1);
  });
});

describe("createRpcLoader params handling", () => {
  test("omitted params, {}, and undefined all share the same batch", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createStringParamsLoader()(ctx);

    await Promise.all([
      wrapper.load(1n),
      wrapper.load(2n, {}),
      wrapper.load(3n, undefined),
    ]);

    expect(calls.length).toBe(1);
  });

  test("same params (by value) share a batch even from different object instances", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createStringParamsLoader()(ctx);

    await Promise.all([
      wrapper.load(1n, { body: "shared" }),
      wrapper.load(2n, { body: "shared" }),
    ]);

    expect(calls.length).toBe(1);
  });

  test("load(k1, paramsA) and load(k2, paramsB) in the same tick split into separate batches", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createStringParamsLoader()(ctx);

    await Promise.all([
      wrapper.load(1n, { body: "a" }),
      wrapper.load(2n, { body: "b" }),
    ]);

    expect(calls.length).toBe(2);
  });

  test("same bigint-valued params (by value) share a batch", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createBigintParamsLoader()(ctx);

    await Promise.all([
      wrapper.load(1n, { id: 42n }),
      wrapper.load(2n, { id: 42n }),
    ]);

    expect(calls.length).toBe(1);
  });

  test("different bigint-valued params split into separate batches", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    const wrapper = createBigintParamsLoader()(ctx);

    await Promise.all([
      wrapper.load(1n, { id: 42n }),
      wrapper.load(2n, { id: 43n }),
    ]);

    expect(calls.length).toBe(2);
  });

  test("required-vs-optional params is a type-level distinction only: createRpcLoader never enforces it at runtime", async () => {
    const { ctx, calls } = createFakePostsService((req) => ({
      posts: req.id.map((id) => ({ id, body: `post-${id}` })),
    }));
    // CreatePostRequestSchema has a `body` field that generated code could
    // mark "required" (design.md §3 V9) and reflect in the exported const's
    // annotation, but createRpcLoader's own `RpcLoader` always types params
    // as optional (`PArgs` is `[params?: ...]`) — omitting it here never
    // throws, proving the requiredness is enforced by the generated
    // annotation (checked by the golden typecheck), not by this runtime.
    const wrapper = createStringParamsLoader()(ctx);

    const post = await wrapper.load(1n);

    expect(post?.id).toBe(1n);
    expect(calls.length).toBe(1);
  });
});
