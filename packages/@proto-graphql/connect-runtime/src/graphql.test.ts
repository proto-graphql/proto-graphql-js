import { Code, ConnectError, createRouterTransport } from "@connectrpc/connect";
import { PostsService } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/options/schema/schema_pb";
import { GraphQLError } from "graphql";
import { describe, expect, test } from "vitest";
import { getClient } from "./client.js";
import type { ProtoGraphqlConnectContext } from "./context.js";
import { callRpc, defaultConnectErrorHandler } from "./graphql.js";

function createCtx(
  handler: Parameters<typeof createRouterTransport>[0],
  overrides?: Partial<ProtoGraphqlConnectContext["protoGraphql"]>,
): ProtoGraphqlConnectContext {
  const transport = createRouterTransport(handler);
  return { protoGraphql: { transport, ...overrides } };
}

describe("callRpc", () => {
  test("passes the resolved value through on success", async () => {
    const ctx = createCtx(({ service }) => {
      service(PostsService, {
        async createPost(req) {
          return { id: 1n, body: req.body };
        },
      });
    });

    const client = getClient(ctx, PostsService);
    const result = await callRpc(ctx, (opts) =>
      client.createPost({ body: "hello" }, opts),
    );

    expect(result.body).toBe("hello");
  });

  test("applies ctx's callOptions and the RPC handler observes them", async () => {
    let observedHeader: string | null = null;
    const ctx = createCtx(
      ({ service }) => {
        service(PostsService, {
          async createPost(req, handlerCtx) {
            observedHeader = handlerCtx.requestHeader.get("x-test");
            return { id: 1n, body: req.body };
          },
        });
      },
      { callOptions: () => ({ headers: { "x-test": "abc" } }) },
    );

    const client = getClient(ctx, PostsService);
    await callRpc(ctx, (opts) => client.createPost({ body: "hi" }, opts));

    expect(observedHeader).toBe("abc");
  });

  test("converts a thrown ConnectError into a GraphQLError via the default handler", async () => {
    const ctx = createCtx(({ service }) => {
      service(PostsService, {
        async createPost() {
          throw new ConnectError("no such post", Code.NotFound);
        },
      });
    });

    const client = getClient(ctx, PostsService);
    const promise = callRpc(ctx, (opts) => client.createPost({}, opts));

    await expect(promise).rejects.toBeInstanceOf(GraphQLError);
    await promise.catch((err: GraphQLError) => {
      expect(err.message).toBe("no such post");
      expect(err.extensions.code).toBe("NOT_FOUND");
    });
  });

  test("uses ctx's errorHandler override instead of the default when provided", async () => {
    const ctx = createCtx(
      ({ service }) => {
        service(PostsService, {
          async createPost() {
            throw new ConnectError("nope", Code.PermissionDenied);
          },
        });
      },
      { errorHandler: (err) => new Error(`custom: ${err.code}`) },
    );

    const client = getClient(ctx, PostsService);
    const promise = callRpc(ctx, (opts) => client.createPost({}, opts));

    await expect(promise).rejects.toThrow(`custom: ${Code.PermissionDenied}`);
  });

  test("rethrows a non-Connect error unchanged", async () => {
    const ctx = createCtx(() => {});

    const boom = new TypeError("boom");
    await expect(
      callRpc(ctx, async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);
  });
});

describe("defaultConnectErrorHandler", () => {
  test("maps rawMessage and code to a GraphQLError", () => {
    const err = new ConnectError("invalid input", Code.InvalidArgument);

    const graphqlError = defaultConnectErrorHandler(err);

    expect(graphqlError).toBeInstanceOf(GraphQLError);
    expect(graphqlError.message).toBe("invalid input");
    expect(graphqlError.extensions.code).toBe("INVALID_ARGUMENT");
  });

  test("does not include error details by default", () => {
    const err = new ConnectError("boom", Code.Internal);

    const graphqlError = defaultConnectErrorHandler(err);

    expect(graphqlError.extensions.details).toBeUndefined();
  });
});
