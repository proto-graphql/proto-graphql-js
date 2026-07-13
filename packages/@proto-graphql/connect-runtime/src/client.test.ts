import { createRouterTransport } from "@connectrpc/connect";
import { PostsService } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/options/schema/schema_pb";
import { describe, expect, test } from "vitest";
import { getClient } from "./client.js";
import type { ProtoGraphqlConnectContext } from "./context.js";

function createFakeTransport(label: string) {
  const calls: string[] = [];
  const transport = createRouterTransport(({ service }) => {
    service(PostsService, {
      async createPost(req) {
        calls.push(`${label}:${req.body}`);
        return { id: 1n, body: req.body };
      },
    });
  });
  return { transport, calls };
}

describe("getClient", () => {
  test("memoizes the client for the same ctx and service", () => {
    const { transport } = createFakeTransport("a");
    const ctx: ProtoGraphqlConnectContext = { protoGraphql: { transport } };

    expect(getClient(ctx, PostsService)).toBe(getClient(ctx, PostsService));
  });

  test("memoizes the client across different ctx objects that share a transport", () => {
    const { transport } = createFakeTransport("a");
    const ctxA: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
    const ctxB: ProtoGraphqlConnectContext = { protoGraphql: { transport } };

    expect(getClient(ctxA, PostsService)).toBe(getClient(ctxB, PostsService));
  });

  test("uses independent clients for independent default transports", async () => {
    const a = createFakeTransport("a");
    const b = createFakeTransport("b");
    const ctxA: ProtoGraphqlConnectContext = {
      protoGraphql: { transport: a.transport },
    };
    const ctxB: ProtoGraphqlConnectContext = {
      protoGraphql: { transport: b.transport },
    };

    const clientA = getClient(ctxA, PostsService);
    const clientB = getClient(ctxB, PostsService);
    expect(clientA).not.toBe(clientB);

    await clientA.createPost({ body: "hello" });

    expect(a.calls).toEqual(["a:hello"]);
    expect(b.calls).toEqual([]);
  });

  test("routes to the per-service transport override instead of the default transport", async () => {
    const def = createFakeTransport("default");
    const override = createFakeTransport("override");
    const ctx: ProtoGraphqlConnectContext = {
      protoGraphql: {
        transport: def.transport,
        transports: new Map([[PostsService.typeName, override.transport]]),
      },
    };

    await getClient(ctx, PostsService).createPost({ body: "hi" });

    expect(override.calls).toEqual(["override:hi"]);
    expect(def.calls).toEqual([]);
  });
});
