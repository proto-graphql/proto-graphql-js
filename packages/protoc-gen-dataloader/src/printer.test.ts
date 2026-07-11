import { create, createFileRegistry, setExtension } from "@bufbuild/protobuf";
import {
  type CodeGeneratorRequest,
  CodeGeneratorRequestSchema,
  DescriptorProtoSchema,
  type FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FieldDescriptorProtoSchema,
  FileDescriptorProtoSchema,
  file_google_protobuf_descriptor,
  type MethodDescriptorProto,
  MethodDescriptorProtoSchema,
  type MethodOptions,
  MethodOptionsSchema,
  ServiceDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import { protocGenDataloader } from "./plugin.js";

const PKG = "protoc_gen_dataloader.printer_test";
const T = FieldDescriptorProto_Type;
const OPTIONAL = FieldDescriptorProto_Label.OPTIONAL;
const REPEATED = FieldDescriptorProto_Label.REPEATED;

function fld(
  name: string,
  number: number,
  type: FieldDescriptorProto_Type,
  label: FieldDescriptorProto_Label,
  typeName?: string,
  extendee?: string,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number,
    type,
    label,
    typeName,
    extendee,
  });
}

const repeatedScalar = (name: string, n: number) =>
  fld(name, n, T.STRING, REPEATED);
const repeatedMessage = (name: string, n: number, pkg: string, msg: string) =>
  fld(name, n, T.MESSAGE, REPEATED, `.${pkg}.${msg}`);
const singularString = (name: string, n: number) =>
  fld(name, n, T.STRING, OPTIONAL);

// Field numbers copied from proto-graphql/proto/graphql/schema.proto:
//   extend google.protobuf.MethodOptions { GraphqlRpcOptions rpc = 2056; }
//   message GraphqlRpcOptions { ... GraphqlRpcBatchOptions batch = 5; ... }
const RPC_EXTENSION_NUMBER = 2056;
const BATCH_FIELD_NUMBER = 5;

/**
 * A wire-compatible, locally-declared subset of graphql/schema.proto's
 * `(graphql.rpc).batch` extension. Declared here (instead of reaching into
 * `@proto-graphql/codegen-core`'s internal, deliberately-unexported generated
 * extensions module) so this smoke test's fixtures are self-contained.
 * Protobuf extensions are matched by field number on the wire, so a
 * `MethodOptions` built with this registry round-trips correctly through the
 * real `resolveBatchSpec` -> `getRpcOptions` -> `getExtension` call inside
 * the plugin under test.
 */
function buildBatchOptionsRegistry() {
  const file = create(FileDescriptorProtoSchema, {
    name: "dataloader_test_options.proto",
    package: PKG,
    syntax: "proto3",
    dependency: ["google/protobuf/descriptor.proto"],
    messageType: [
      create(DescriptorProtoSchema, {
        name: "GraphqlRpcBatchOptions",
        field: [
          singularString("key_field", 1),
          singularString("entity_field", 2),
          singularString("entity_key", 3),
          fld("group", 4, T.BOOL, OPTIONAL),
          fld("max_batch_size", 5, T.UINT32, OPTIONAL),
        ],
      }),
      create(DescriptorProtoSchema, {
        name: "GraphqlRpcOptions",
        field: [
          fld(
            "batch",
            BATCH_FIELD_NUMBER,
            T.MESSAGE,
            OPTIONAL,
            `.${PKG}.GraphqlRpcBatchOptions`,
          ),
        ],
      }),
    ],
    extension: [
      fld(
        "rpc",
        RPC_EXTENSION_NUMBER,
        T.MESSAGE,
        OPTIONAL,
        `.${PKG}.GraphqlRpcOptions`,
        ".google.protobuf.MethodOptions",
      ),
    ],
  });
  return createFileRegistry(file, (name) =>
    name === "google/protobuf/descriptor.proto"
      ? file_google_protobuf_descriptor
      : undefined,
  );
}

function batchMethodOptions(batch: {
  entityKey?: string;
  keyField?: string;
  entityField?: string;
  group?: boolean;
  maxBatchSize?: number;
}): MethodOptions {
  const registry = buildBatchOptionsRegistry();
  const rpcExt = registry.getExtension(`${PKG}.rpc`);
  const rpcOptionsDesc = registry.getMessage(`${PKG}.GraphqlRpcOptions`);
  const batchOptionsDesc = registry.getMessage(`${PKG}.GraphqlRpcBatchOptions`);
  if (rpcExt == null || rpcOptionsDesc == null || batchOptionsDesc == null) {
    throw new Error(
      "failed to build the local (graphql.rpc).batch test registry",
    );
  }

  const batchValue = create(batchOptionsDesc, {
    keyField: batch.keyField ?? "",
    entityField: batch.entityField ?? "",
    entityKey: batch.entityKey ?? "",
    group: batch.group ?? false,
    maxBatchSize: batch.maxBatchSize ?? 0,
  });
  const rpcValue = create(rpcOptionsDesc, { batch: batchValue });

  const methodOptions = create(MethodOptionsSchema, {});
  setExtension(methodOptions, rpcExt, rpcValue);
  return methodOptions;
}

function methodProto(
  name: string,
  inputType: string,
  outputType: string,
  options: MethodOptions,
): MethodDescriptorProto {
  return create(MethodDescriptorProtoSchema, {
    name,
    inputType,
    outputType,
    options,
  });
}

/**
 * Builds a single-file `CodeGeneratorRequest` covering the three shapes the
 * task's final report needs: an entity loader (no params, key inferred), an
 * entity loader with a required non-key param (`view`), and a group loader
 * with `max_batch_size`.
 */
function buildSuccessRequest(): CodeGeneratorRequest {
  const pkg = `${PKG}.success`;

  const userMsg = create(DescriptorProtoSchema, {
    name: "User",
    field: [singularString("id", 1), singularString("name", 2)],
  });
  const batchGetUsersRequest = create(DescriptorProtoSchema, {
    name: "BatchGetUsersRequest",
    field: [repeatedScalar("ids", 1)],
  });
  const batchGetUsersResponse = create(DescriptorProtoSchema, {
    name: "BatchGetUsersResponse",
    field: [repeatedMessage("users", 1, pkg, "User")],
  });
  // `view` is a plain proto3 scalar field (no `optional` keyword), so it's
  // "required" under `isRequiredField(field, "input")` (V9) and should force
  // the loader's `params` argument to be required at the type level.
  const batchGetUsersWithViewRequest = create(DescriptorProtoSchema, {
    name: "BatchGetUsersWithViewRequest",
    field: [repeatedScalar("ids", 1), singularString("view", 2)],
  });

  const reviewMsg = create(DescriptorProtoSchema, {
    name: "Review",
    field: [
      singularString("id", 1),
      singularString("user_id", 2),
      singularString("comment", 3),
    ],
  });
  const batchListReviewsByUsersRequest = create(DescriptorProtoSchema, {
    name: "BatchListReviewsByUsersRequest",
    field: [repeatedScalar("user_ids", 1)],
  });
  const batchListReviewsByUsersResponse = create(DescriptorProtoSchema, {
    name: "BatchListReviewsByUsersResponse",
    field: [repeatedMessage("reviews", 1, pkg, "Review")],
  });

  const fileProto = create(FileDescriptorProtoSchema, {
    name: "user_and_review.proto",
    package: pkg,
    syntax: "proto3",
    messageType: [
      userMsg,
      batchGetUsersRequest,
      batchGetUsersResponse,
      batchGetUsersWithViewRequest,
      reviewMsg,
      batchListReviewsByUsersRequest,
      batchListReviewsByUsersResponse,
    ],
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "UserService",
        method: [
          methodProto(
            "BatchGetUsers",
            `.${pkg}.BatchGetUsersRequest`,
            `.${pkg}.BatchGetUsersResponse`,
            // key_field/entity_field omitted: both are inferred (V2/V3).
            batchMethodOptions({ entityKey: "id" }),
          ),
          methodProto(
            "BatchGetUsersWithView",
            `.${pkg}.BatchGetUsersWithViewRequest`,
            `.${pkg}.BatchGetUsersResponse`,
            batchMethodOptions({ entityKey: "id" }),
          ),
        ],
      }),
      create(ServiceDescriptorProtoSchema, {
        name: "ReviewService",
        method: [
          methodProto(
            "BatchListReviewsByUsers",
            `.${pkg}.BatchListReviewsByUsersRequest`,
            `.${pkg}.BatchListReviewsByUsersResponse`,
            batchMethodOptions({
              group: true,
              entityKey: "user_id",
              maxBatchSize: 100,
            }),
          ),
        ],
      }),
    ],
  });

  return create(CodeGeneratorRequestSchema, {
    fileToGenerate: [fileProto.name],
    protoFile: [fileProto],
    parameter: "",
  });
}

/**
 * A request/response pair with two repeated scalar fields on the request, so
 * `key_field` inference (V2) is ambiguous and `resolveBatchSpec` returns
 * `{ ok: false }` for `BadService.BadBatch`.
 */
function buildErrorRequest(): CodeGeneratorRequest {
  const pkg = `${PKG}.errors`;

  const userMsg = create(DescriptorProtoSchema, {
    name: "User",
    field: [singularString("id", 1)],
  });
  const badRequest = create(DescriptorProtoSchema, {
    name: "BadRequest",
    field: [repeatedScalar("ids", 1), repeatedScalar("other_ids", 2)],
  });
  const badResponse = create(DescriptorProtoSchema, {
    name: "BadResponse",
    field: [repeatedMessage("users", 1, pkg, "User")],
  });

  const fileProto = create(FileDescriptorProtoSchema, {
    name: "bad_service.proto",
    package: pkg,
    syntax: "proto3",
    messageType: [userMsg, badRequest, badResponse],
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "BadService",
        method: [
          methodProto(
            "BadBatch",
            `.${pkg}.BadRequest`,
            `.${pkg}.BadResponse`,
            batchMethodOptions({ entityKey: "id" }),
          ),
        ],
      }),
    ],
  });

  return create(CodeGeneratorRequestSchema, {
    fileToGenerate: [fileProto.name],
    protoFile: [fileProto],
    parameter: "",
  });
}

describe("protocGenDataloader", () => {
  it("generates entity, group, and required-params loaders", () => {
    const resp = protocGenDataloader.run(buildSuccessRequest());

    expect(resp.error).toBeFalsy();
    expect(resp.file.map((f) => f.name)).toEqual([
      "user_and_review.pb.dataloader.ts",
    ]);
    expect(resp.file[0]?.content).toMatchInlineSnapshot(`
      "// @generated by protoc-gen-dataloader v0.0.0
      // @generated from file user_and_review.proto (package protoc_gen_dataloader.printer_test.success, syntax proto3)
      /* eslint-disable */

      import type { ProtoGraphqlConnectContext } from "@proto-graphql/connect-runtime";
      import { createRpcLoader } from "@proto-graphql/connect-runtime";
      import type { DataLoader } from "dataloader";
      import type { MessageInitShape, MessageShape } from "@bufbuild/protobuf";
      import { create } from "@bufbuild/protobuf";
      import {
        BatchGetUsersRequestSchema,
        BatchGetUsersWithViewRequestSchema,
        BatchListReviewsByUsersRequestSchema,
        ReviewSchema,
        ReviewService,
        UserSchema,
        UserService,
      } from "./user_and_review_pb";

      export const batchGetUsersLoader: (
        ctx: ProtoGraphqlConnectContext,
      ) => DataLoader<string, MessageShape<typeof UserSchema> | null> =
        createRpcLoader({
          service: UserService,
          method: "batchGetUsers",
          requestSchema: BatchGetUsersRequestSchema,
          call: (client, keys, params, opts) =>
            client.batchGetUsers(
              create(BatchGetUsersRequestSchema, { ...params, ids: [...keys] }),
              opts,
            ),
          extractEntities: (res) => res.users,
          extractKey: (user: MessageShape<typeof UserSchema>) => user.id,
        });

      export type BatchGetUsersWithViewLoaderParams = Omit<
        MessageInitShape<typeof BatchGetUsersWithViewRequestSchema>,
        "ids"
      >;

      export const batchGetUsersWithViewLoader: (
        ctx: ProtoGraphqlConnectContext,
        params: BatchGetUsersWithViewLoaderParams,
      ) => DataLoader<string, MessageShape<typeof UserSchema> | null> =
        createRpcLoader({
          service: UserService,
          method: "batchGetUsersWithView",
          requestSchema: BatchGetUsersWithViewRequestSchema,
          call: (client, keys, params, opts) =>
            client.batchGetUsersWithView(
              create(BatchGetUsersWithViewRequestSchema, {
                ...params,
                ids: [...keys],
              }),
              opts,
            ),
          extractEntities: (res) => res.users,
          extractKey: (user: MessageShape<typeof UserSchema>) => user.id,
        });

      export const batchListReviewsByUsersLoader: (
        ctx: ProtoGraphqlConnectContext,
      ) => DataLoader<string, MessageShape<typeof ReviewSchema>[]> = createRpcLoader({
        service: ReviewService,
        method: "batchListReviewsByUsers",
        requestSchema: BatchListReviewsByUsersRequestSchema,
        call: (client, keys, params, opts) =>
          client.batchListReviewsByUsers(
            create(BatchListReviewsByUsersRequestSchema, {
              ...params,
              userIds: [...keys],
            }),
            opts,
          ),
        extractEntities: (res) => res.reviews,
        extractKey: (review: MessageShape<typeof ReviewSchema>) => review.userId,
        group: true,
        maxBatchSize: 100,
      });
      "
    `);
  });

  it("fails generation and lists every invalid batch declaration", () => {
    expect(() =>
      protocGenDataloader.run(buildErrorRequest()),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: BadService.BadBatch: Cannot infer key_field for (graphql.rpc).batch on BadService.BadBatch: request message BadRequest has multiple repeated fields (["ids", "other_ids"]). Set key_field explicitly to disambiguate. Example: option (graphql.rpc).batch = { key_field: "ids" };]`,
    );
  });
});
