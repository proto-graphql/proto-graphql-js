import type { MessageInitShape } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { Code, ConnectError, createRouterTransport } from "@connectrpc/connect";
import type {
  CreateUserRequest,
  GetUserRequest,
  RenameUserRequest,
  SearchUsersRequest,
  User,
} from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/service/basic/basic_pb";
import { UserService } from "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/testapis/service/basic/basic_pb";
import { graphql } from "graphql";
import { describe, expect, test } from "vitest";
import type { Context } from "./builder.js";
import { schema } from "./schema.js";

type FakeUser = MessageInitShape<GenMessage<User>>;

/**
 * Spins up a fake UserService over an in-memory Connect transport (design.md
 * §5, item 2), driving the *generated* `basic.pb.pothos.ts` resolvers rather than
 * hand-rolled ones — proving arg-to-request assembly, response mapping, and
 * error conversion are wired correctly end to end through a real GraphQL
 * execution.
 *
 * Each test only supplies the handlers it exercises; connect-es's
 * `ServiceImpl` is a `Partial`, so unimplemented methods simply aren't
 * registered (and would 501 if called, which none of these tests do).
 */
function createFakeUserService(handlers: {
  getUser?: (req: GetUserRequest) => FakeUser;
  searchUsers?: (req: SearchUsersRequest) => { users: FakeUser[] };
  createUser?: (req: CreateUserRequest) => FakeUser;
  renameUser?: (req: RenameUserRequest) => FakeUser;
  pingUser?: (req: GetUserRequest) => Record<string, never>;
  deleteUser?: (req: GetUserRequest) => Record<string, never>;
}) {
  const seen: {
    getUser: GetUserRequest[];
    searchUsers: SearchUsersRequest[];
    createUser: CreateUserRequest[];
    renameUser: RenameUserRequest[];
    pingUser: GetUserRequest[];
    deleteUser: GetUserRequest[];
  } = {
    getUser: [],
    searchUsers: [],
    createUser: [],
    renameUser: [],
    pingUser: [],
    deleteUser: [],
  };

  function unexpectedCall(method: string): never {
    throw new Error(`unexpected call to UserService.${method} in this test`);
  }

  const transport = createRouterTransport(({ service }) => {
    service(UserService, {
      async getUser(req) {
        seen.getUser.push(req);
        if (!handlers.getUser) unexpectedCall("getUser");
        return handlers.getUser(req);
      },
      async searchUsers(req) {
        seen.searchUsers.push(req);
        if (!handlers.searchUsers) unexpectedCall("searchUsers");
        return handlers.searchUsers(req);
      },
      async createUser(req) {
        seen.createUser.push(req);
        if (!handlers.createUser) unexpectedCall("createUser");
        return handlers.createUser(req);
      },
      async renameUser(req) {
        seen.renameUser.push(req);
        if (!handlers.renameUser) unexpectedCall("renameUser");
        return handlers.renameUser(req);
      },
      async pingUser(req) {
        seen.pingUser.push(req);
        if (!handlers.pingUser) unexpectedCall("pingUser");
        return handlers.pingUser(req);
      },
      async deleteUser(req) {
        seen.deleteUser.push(req);
        if (!handlers.deleteUser) unexpectedCall("deleteUser");
        return handlers.deleteUser(req);
      },
    });
  });

  const contextValue: Context = { protoGraphql: { transport } };
  return { contextValue, seen };
}

describe("getUser (Query, flattened scalar arg)", () => {
  test("maps the arg into the request and the response back into GraphQL", async () => {
    const { contextValue, seen } = createFakeUserService({
      getUser: (req) => ({ id: req.userId, name: `user-${req.userId}` }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        query ($userId: String!) {
          getUser(userId: $userId) { id name }
        }
      `,
      variableValues: { userId: "u1" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.getUser).toEqual({ id: "u1", name: "user-u1" });
    expect(seen.getUser[0]?.userId).toBe("u1");
  });

  test("a NOT_FOUND ConnectError becomes a GraphQLError with extensions.code, and nulls the (non-null) root field", async () => {
    const { contextValue } = createFakeUserService({
      getUser: () => {
        throw new ConnectError("no such user", Code.NotFound);
      },
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        query ($userId: String!) {
          getUser(userId: $userId) { id }
        }
      `,
      variableValues: { userId: "missing" },
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.message).toBe("no such user");
    expect(result.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");
    // getUser is non-null: the error nulls the field, which has no nullable
    // ancestor to stop at, so the whole response's `data` is null (GraphQL
    // spec §Errors and Non-Nullability).
    expect(result.data).toBeNull();
  });

  test("ctx's callOptions header reaches the RPC handler", async () => {
    let observedHeader: string | null = null;
    const transport = createRouterTransport(({ service }) => {
      service(UserService, {
        async getUser(req, handlerCtx) {
          // Cast to a minimal shape rather than relying on the ambient
          // `Headers` lib type: this case's tsconfig has no "dom" lib, and
          // `HandlerContext.requestHeader`'s declared `Headers` type isn't
          // otherwise resolvable here.
          const headers = handlerCtx.requestHeader as unknown as {
            get(name: string): string | null;
          };
          observedHeader = headers.get("x-test");
          return { id: req.userId, name: "n" };
        },
      });
    });
    const contextValue: Context = {
      protoGraphql: {
        transport,
        callOptions: () => ({ headers: { "x-test": "abc" } }),
      },
    };

    const result = await graphql({
      schema,
      contextValue,
      source: `query ($userId: String!) { getUser(userId: $userId) { id } }`,
      variableValues: { userId: "u1" },
    });

    expect(result.errors).toBeUndefined();
    expect(observedHeader).toBe("abc");
  });
});

describe("searchUsers (Query, flattened message + oneof args, expose_field list return)", () => {
  test("assembles a message arg and a message-typed oneof member, and unwraps `users`", async () => {
    const { contextValue, seen } = createFakeUserService({
      searchUsers: () => ({
        users: [
          { id: "1", name: "Ann" },
          { id: "2", name: "Bob" },
        ],
      }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        query {
          searchUsers(
            queryText: "a"
            role: ADMIN
            address: { city: "Metropolis", zip: "10001" }
            home: { city: "Springfield", zip: "00000" }
          ) { id name }
        }
      `,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.searchUsers).toEqual([
      { id: "1", name: "Ann" },
      { id: "2", name: "Bob" },
    ]);

    const req = seen.searchUsers[0];
    expect(req?.queryText).toBe("a");
    expect(req?.address?.city).toBe("Metropolis");
    // Message-typed oneof member: reconstructed as a `{ case, value }` union.
    expect(req?.filter.case).toBe("home");
    expect(req?.filter.case === "home" && req.filter.value.city).toBe(
      "Springfield",
    );
  });
});

describe("createUser (Mutation, single input arg)", () => {
  test("converts the input object via $toProto before the RPC call", async () => {
    const { contextValue, seen } = createFakeUserService({
      createUser: (req) => ({ id: "new-1", name: req.name }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        mutation ($input: CreateUserRequestInput!) {
          createUser(input: $input) { id name }
        }
      `,
      variableValues: {
        input: { name: "Ann", address: { city: "Metropolis", zip: "10001" } },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.createUser).toEqual({ id: "new-1", name: "Ann" });
    expect(seen.createUser[0]?.name).toBe("Ann");
    expect(seen.createUser[0]?.address?.city).toBe("Metropolis");
  });
});

describe("updateUserName (Mutation, `(graphql.rpc).name` override)", () => {
  test("is exposed under its renamed field, not `renameUser`", async () => {
    const { contextValue, seen } = createFakeUserService({
      renameUser: (req) => ({ id: req.userId, name: req.newName }),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        mutation ($input: RenameUserRequestInput!) {
          updateUserName(input: $input) { id name }
        }
      `,
      variableValues: { input: { userId: "u1", newName: "New Name" } },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.updateUserName).toEqual({ id: "u1", name: "New Name" });
    expect(seen.renameUser[0]?.newName).toBe("New Name");
  });
});

describe("pingUser (Query) / deleteUser (Mutation): Empty response -> Boolean", () => {
  test("pingUser always returns true, discarding the Empty response", async () => {
    const { contextValue, seen } = createFakeUserService({
      pingUser: () => ({}),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `query ($userId: String!) { pingUser(userId: $userId) }`,
      variableValues: { userId: "u1" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.pingUser).toBe(true);
    expect(seen.pingUser[0]?.userId).toBe("u1");
  });

  test("deleteUser always returns true, discarding the Empty response", async () => {
    const { contextValue, seen } = createFakeUserService({
      deleteUser: () => ({}),
    });

    const result = await graphql({
      schema,
      contextValue,
      source: `
        mutation ($input: GetUserRequestInput!) { deleteUser(input: $input) }
      `,
      variableValues: { input: { userId: "u1" } },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.deleteUser).toBe(true);
    expect(seen.deleteUser[0]?.userId).toBe("u1");
  });
});
