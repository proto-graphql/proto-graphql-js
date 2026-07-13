import type { MessageInitShape } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { createRouterTransport } from "@connectrpc/connect";
import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";
import {
  type BatchListReviewsByUsersRequest,
  type BatchListReviewsByUsersResponse,
  ReviewService,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/dataloader/group/group_pb";
import { describe, expect, test } from "vitest";
import { batchListReviewsByUsersLoader } from "./__generated__/testapis/dataloader/group/group.pb.dataloader.js";

type FakeReviewsResponse = MessageInitShape<
  GenMessage<BatchListReviewsByUsersResponse>
>;

/**
 * Spins up a fake ReviewService over an in-memory Connect transport
 * (design.md §8-3), driving the *generated* `group.pb.dataloader.ts` loader
 * rather than a hand-rolled `createRpcLoader` config — proving the generated
 * `group: true` wiring (call/extractEntities/extractKey) is correct on top
 * of connect-runtime's own already-covered groupBy semantics (see
 * packages/@proto-graphql/connect-runtime/src/rpcLoader.test.ts).
 */
function createFakeReviewService(
  handler: (req: BatchListReviewsByUsersRequest) => FakeReviewsResponse,
) {
  const calls: BatchListReviewsByUsersRequest[] = [];
  const transport = createRouterTransport(({ service }) => {
    service(ReviewService, {
      async batchListReviewsByUsers(req) {
        calls.push(req);
        return handler(req);
      },
    });
  });
  const ctx: ProtoGraphqlConnectContext = { protoGraphql: { transport } };
  return { ctx, calls };
}

describe("batchListReviewsByUsersLoader (group mode, entity_key: user_id)", () => {
  test("groups multiple reviews under the same user_id key, and resolves a missing key to []", async () => {
    const { ctx } = createFakeReviewService((req) => ({
      reviews: req.userIds.flatMap((userId) => {
        if (userId === "u1") {
          return [
            { id: "r1", userId, body: "a" },
            { id: "r2", userId, body: "b" },
          ];
        }
        if (userId === "u2") {
          return [{ id: "r3", userId, body: "solo" }];
        }
        // u3: no reviews for this user.
        return [];
      }),
    }));

    const [group1, group2, group3] = await Promise.all([
      batchListReviewsByUsersLoader(ctx).load("u1"),
      batchListReviewsByUsersLoader(ctx).load("u2"),
      batchListReviewsByUsersLoader(ctx).load("u3"),
    ]);

    expect(group1.map((r) => r.body)).toEqual(["a", "b"]);
    expect(group2.map((r) => r.body)).toEqual(["solo"]);
    expect(group3).toEqual([]);
  });

  test("merges concurrent loads for the same ctx into a single call", async () => {
    const { ctx, calls } = createFakeReviewService((req) => ({
      reviews: req.userIds.map((userId) => ({
        id: `r-${userId}`,
        userId,
        body: `review for ${userId}`,
      })),
    }));

    await Promise.all([
      batchListReviewsByUsersLoader(ctx).load("u1"),
      batchListReviewsByUsersLoader(ctx).load("u2"),
    ]);

    expect(calls.length).toBe(1);
  });
});
