import { createRouterTransport } from "@connectrpc/connect";
import type {
  CreateTaskRequest,
  ListTasksRequest,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/service/transforms/transforms_pb";
import { TaskService } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/service/transforms/transforms_pb";
import { graphql } from "graphql";
import { describe, expect, test } from "vitest";
import type { Context } from "./builder.js";
import { schema } from "./schema.js";

/**
 * Proves that `requests_as_inputs`/`responses_as_payloads` (design.md §2,
 * §7) flow all the way through a real GraphQL execution: the Mutation's
 * `input` arg is the transformed `CreateTaskInput`, and both operations
 * return the transformed `*Payload` object type (design.md §5, item 2).
 */
function createFakeTaskService(handlers: {
  createTask?: (req: CreateTaskRequest) => {
    task: { id: string; title: string };
  };
  listTasks?: (req: ListTasksRequest) => {
    tasks: { id: string; title: string }[];
  };
}) {
  const seen: {
    createTask: CreateTaskRequest[];
    listTasks: ListTasksRequest[];
  } = {
    createTask: [],
    listTasks: [],
  };

  function unexpectedCall(method: string): never {
    throw new Error(`unexpected call to TaskService.${method} in this test`);
  }

  const transport = createRouterTransport(({ service }) => {
    service(TaskService, {
      async createTask(req) {
        seen.createTask.push(req);
        if (!handlers.createTask) unexpectedCall("createTask");
        return handlers.createTask(req);
      },
      async listTasks(req) {
        seen.listTasks.push(req);
        if (!handlers.listTasks) unexpectedCall("listTasks");
        return handlers.listTasks(req);
      },
    });
  });

  const contextValue: Context = { protoGraphql: { transport } };
  return { contextValue, seen };
}

describe("createTask (Mutation, requests_as_inputs + responses_as_payloads)", () => {
  test("takes a CreateTaskInput and returns a CreateTaskPayload", async () => {
    const { contextValue, seen } = createFakeTaskService({
      createTask: (req) => ({ task: { id: "t1", title: req.title } }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        mutation ($input: CreateTaskInput!) {
          createTask(input: $input) {
            __typename
            task { id title }
          }
        }
      `,
      variableValues: { input: { title: "Write tests" } },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.createTask).toEqual({
      __typename: "CreateTaskPayload",
      task: { id: "t1", title: "Write tests" },
    });
    expect(seen.createTask[0]?.title).toBe("Write tests");
  });
});

describe("listTasks (Query, requests_as_inputs + responses_as_payloads)", () => {
  test("flattens ListTasksRequest into args and returns a ListTasksPayload", async () => {
    const { contextValue, seen } = createFakeTaskService({
      listTasks: () => ({
        tasks: [
          { id: "t1", title: "a" },
          { id: "t2", title: "b" },
        ],
      }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        query ($filter: String) {
          listTasks(filter: $filter) {
            __typename
            tasks { id title }
          }
        }
      `,
      variableValues: { filter: "open" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.listTasks).toEqual({
      __typename: "ListTasksPayload",
      tasks: [
        { id: "t1", title: "a" },
        { id: "t2", title: "b" },
      ],
    });
    expect(seen.listTasks[0]?.filter).toBe("open");
  });
});
