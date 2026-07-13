import {
  create,
  createFileRegistry,
  type DescMethod,
  type MessageInitShape,
  setExtension,
} from "@bufbuild/protobuf";
import {
  type DescriptorProto,
  DescriptorProtoSchema,
  type FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FieldDescriptorProtoSchema,
  FileDescriptorProtoSchema,
  MethodDescriptorProtoSchema,
  type MethodOptions,
  MethodOptionsSchema,
  ServiceDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import { type BatchSpecResult, resolveBatchSpec } from "./batchSpec";

const PKG = "codegen_core.batch_test";
const REPEATED = FieldDescriptorProto_Label.REPEATED;
const OPTIONAL = FieldDescriptorProto_Label.OPTIONAL;
const T = FieldDescriptorProto_Type;

function fld(
  name: string,
  number: number,
  type: FieldDescriptorProto_Type,
  label: FieldDescriptorProto_Label,
  typeName?: string,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number,
    type,
    label,
    typeName,
  });
}

const repeatedScalar = (name: string, n: number, type = T.STRING) =>
  fld(name, n, type, REPEATED);
const repeatedMessage = (name: string, n: number, msg: string) =>
  fld(name, n, T.MESSAGE, REPEATED, `.${PKG}.${msg}`);
const singularScalar = (name: string, n: number, type = T.STRING) =>
  fld(name, n, type, OPTIONAL);
const singularMessage = (name: string, n: number, msg: string) =>
  fld(name, n, T.MESSAGE, OPTIONAL, `.${PKG}.${msg}`);

function messageProto(
  name: string,
  fields: FieldDescriptorProto[],
): DescriptorProto {
  return create(DescriptorProtoSchema, { name, field: fields });
}

/**
 * Builds an in-code FileDescriptorProto with a single `TestService.<rpcName>`
 * method, resolving the `graphql/schema.proto` dependency straight from the
 * generated extensions module (same technique as util.test.ts). Returns the
 * `DescMethod` for the built method.
 */
function buildMethod(params: {
  requestFields?: FieldDescriptorProto[];
  responseFields?: FieldDescriptorProto[];
  extraMessages?: DescriptorProto[];
  batch?: extensions.GraphqlRpcBatchOptions;
  rpcExtensionWithoutBatch?: boolean;
  streaming?: "client" | "server" | "bidi";
}): DescMethod {
  let methodOptions: MethodOptions | undefined;
  if (params.batch != null || params.rpcExtensionWithoutBatch) {
    methodOptions = create(MethodOptionsSchema, {});
    setExtension(
      methodOptions,
      extensions.rpc,
      create(
        extensions.GraphqlRpcOptionsSchema,
        params.batch != null ? { batch: params.batch } : {},
      ),
    );
  }

  const fileProto = create(FileDescriptorProtoSchema, {
    name: "batch_spec_test.proto",
    package: PKG,
    syntax: "proto3",
    dependency: ["graphql/schema.proto"],
    messageType: [
      messageProto("BatchGetRequest", params.requestFields ?? []),
      messageProto("BatchGetResponse", params.responseFields ?? []),
      ...(params.extraMessages ?? []),
    ],
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "TestService",
        method: [
          create(MethodDescriptorProtoSchema, {
            name: "BatchGet",
            inputType: `.${PKG}.BatchGetRequest`,
            outputType: `.${PKG}.BatchGetResponse`,
            options: methodOptions,
            clientStreaming:
              params.streaming === "client" || params.streaming === "bidi",
            serverStreaming:
              params.streaming === "server" || params.streaming === "bidi",
          }),
        ],
      }),
    ],
  });

  const registry = createFileRegistry(fileProto, (name) =>
    name === "graphql/schema.proto"
      ? extensions.file_graphql_schema
      : undefined,
  );
  const svc = registry.getService(`${PKG}.TestService`);
  if (svc == null) throw new Error("TestService not found");
  return svc.methods[0];
}

const batch = (
  init: MessageInitShape<typeof extensions.GraphqlRpcBatchOptionsSchema> = {},
) => create(extensions.GraphqlRpcBatchOptionsSchema, init);

// A `User` entity with a string `id` field, usable as an explicit entity_key.
const userEntity = () =>
  messageProto("User", [singularScalar("id", 1), singularScalar("name", 2)]);

function expectErr(result: BatchSpecResult | null): string[] {
  expect(result).not.toBeNull();
  if (result == null || result.ok) {
    throw new Error(`expected an error result, got: ${JSON.stringify(result)}`);
  }
  return result.errors;
}

function expectOk(result: BatchSpecResult | null) {
  expect(result).not.toBeNull();
  if (result == null || !result.ok) {
    throw new Error(
      `expected an ok result, got: ${JSON.stringify(result?.ok === false ? result.errors : result)}`,
    );
  }
  return result.spec;
}

describe("resolveBatchSpec", () => {
  describe("no batch option", () => {
    it("returns null when the method has no options at all", () => {
      const method = buildMethod({});
      expect(resolveBatchSpec(method)).toBeNull();
    });

    it("returns null when (graphql.rpc) is set but batch is unset", () => {
      const method = buildMethod({ rpcExtensionWithoutBatch: true });
      expect(resolveBatchSpec(method)).toBeNull();
    });
  });

  describe("inference happy path (entity mode)", () => {
    it("infers key_field and entity_field; entity_key is explicit", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch({ entityKey: "id" }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.keyField.name).toBe("ids");
      expect(spec.entityField.name).toBe("users");
      expect(spec.entityMessage.name).toBe("User");
      expect(spec.entityKeyField.name).toBe("id");
      expect(spec.group).toBe(false);
      expect(spec.keyTsType).toBe("string");
      expect(spec.maxBatchSize).toBeUndefined();
      expect(spec.paramFields).toHaveLength(0);
      expect(spec.paramsRequired).toBe(false);
    });
  });

  describe("group happy path", () => {
    it("resolves a group loader with explicit entity_key and max_batch_size", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("user_ids", 1)],
        responseFields: [repeatedMessage("reviews", 1, "Review")],
        extraMessages: [
          messageProto("Review", [
            singularScalar("id", 1),
            singularScalar("user_id", 2),
          ]),
        ],
        batch: batch({ group: true, entityKey: "user_id", maxBatchSize: 100 }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.group).toBe(true);
      expect(spec.keyField.name).toBe("user_ids");
      expect(spec.entityField.name).toBe("reviews");
      expect(spec.entityKeyField.name).toBe("user_id");
      expect(spec.keyTsType).toBe("string");
      expect(spec.maxBatchSize).toBe(100);
    });
  });

  describe("explicit fields", () => {
    it("uses explicit key_field/entity_field/entity_key and treats extra repeated fields as params", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1), repeatedScalar("tags", 2)],
        responseFields: [
          repeatedMessage("users", 1, "User"),
          repeatedMessage("errors", 2, "Review"),
        ],
        extraMessages: [
          userEntity(),
          messageProto("Review", [singularScalar("id", 1)]),
        ],
        batch: batch({
          keyField: "ids",
          entityField: "users",
          entityKey: "id",
        }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.keyField.name).toBe("ids");
      expect(spec.entityField.name).toBe("users");
      expect(spec.entityKeyField.name).toBe("id");
      expect(spec.paramFields.map((f) => f.name)).toEqual(["tags"]);
    });
  });

  describe("V5: entity_key is required in entity mode (no @key fallback yet)", () => {
    it("errors when entity mode omits entity_key", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("requires an explicit entity_key");
      expect(err).toContain("federation");
      expect(err).toContain('"id"'); // candidate scalar field
      expect(err).toContain("option (graphql.rpc).batch = { entity_key:");
    });
  });

  describe("V1: unary only", () => {
    it("errors on a streaming RPC", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch(),
        streaming: "server",
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("only supported on unary RPCs");
      expect(err).toContain("server_streaming");
    });
  });

  describe("V2: key_field", () => {
    it("errors when the request has no repeated field (inference)", () => {
      const method = buildMethod({
        requestFields: [singularScalar("id", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("Cannot infer key_field");
      expect(err).toContain("no repeated field");
      expect(err).toContain("option (graphql.rpc).batch = { key_field:");
    });

    it("errors when the request has multiple repeated fields (inference)", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1), repeatedScalar("tags", 2)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("multiple repeated fields");
      expect(err).toContain('"ids"');
      expect(err).toContain('"tags"');
      expect(err).toContain("option (graphql.rpc).batch = { key_field:");
    });

    it("errors when an explicit key_field does not exist", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch({ keyField: "missing" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain('refers to "missing"');
      expect(err).toContain('"ids"'); // candidate
      expect(err).toContain("option (graphql.rpc).batch = { key_field:");
    });

    it("errors when an explicit key_field is not a repeated scalar", () => {
      const method = buildMethod({
        requestFields: [repeatedMessage("items", 1, "User")],
        responseFields: [repeatedMessage("users", 2, "User")],
        extraMessages: [userEntity()],
        batch: batch({ keyField: "items" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("must be a repeated scalar field");
      expect(err).toContain("a repeated message field");
    });
  });

  describe("V3: entity_field", () => {
    it("errors when the response has no repeated message field (inference)", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedScalar("names", 1)],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("Cannot infer entity_field");
      expect(err).toContain("no repeated message field");
      expect(err).toContain("option (graphql.rpc).batch = { entity_field:");
    });

    it("errors when the response has multiple repeated message fields (inference)", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [
          repeatedMessage("users", 1, "User"),
          repeatedMessage("admins", 2, "User"),
        ],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("multiple repeated message fields");
      expect(err).toContain('"users"');
      expect(err).toContain('"admins"');
      expect(err).toContain("option (graphql.rpc).batch = { entity_field:");
    });

    it("errors when an explicit entity_field is not a repeated message", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedScalar("names", 1)],
        extraMessages: [userEntity()],
        batch: batch({ entityField: "names" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("must be a repeated message field");
      expect(err).toContain("a repeated scalar field");
    });
  });

  describe("V4: entity_key", () => {
    it("errors when entity_key does not exist on the entity", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch({ entityKey: "missing" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("entity_key on");
      expect(err).toContain('refers to "missing"');
      expect(err).toContain('"id"'); // candidate scalar field
    });

    it("errors when entity_key is not a scalar field", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [
          messageProto("User", [
            singularScalar("id", 1),
            singularMessage("nested", 2, "User"),
          ]),
        ],
        batch: batch({ entityKey: "nested" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("must be a singular scalar field");
      expect(err).toContain("a singular message field");
    });

    it("errors when entity_key type is incompatible with key_field", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1, T.INT64)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()], // id is a string
        batch: batch({ entityKey: "id" }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("not compatible with key_field");
      expect(err).toContain("bigint");
      expect(err).toContain("string");
    });
  });

  describe("V6: group requires entity_key", () => {
    it("errors when a group loader omits entity_key", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("user_ids", 1)],
        responseFields: [repeatedMessage("reviews", 1, "Review")],
        extraMessages: [
          messageProto("Review", [
            singularScalar("id", 1),
            singularScalar("user_id", 2),
          ]),
        ],
        batch: batch({ group: true }),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("group loader");
      expect(err).toContain("requires an explicit entity_key");
      expect(err).toContain('"user_id"'); // candidate scalar field
      expect(err).toContain(
        "option (graphql.rpc).batch = { group: true, entity_key:",
      );
    });
  });

  describe("key type mapping (§4.4)", () => {
    it("maps int64 to bigint", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1, T.INT64)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [
          messageProto("User", [singularScalar("id", 1, T.INT64)]),
        ],
        batch: batch({ entityKey: "id" }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.keyTsType).toBe("bigint");
    });

    it("maps int32 to number", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1, T.INT32)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [
          messageProto("User", [singularScalar("id", 1, T.INT32)]),
        ],
        batch: batch({ entityKey: "id" }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.keyTsType).toBe("number");
    });

    it("errors for an unsupported key type (bool)", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("flags", 1, T.BOOL)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch(),
      });
      const [err] = expectErr(resolveBatchSpec(method));
      expect(err).toContain("not supported as a batch key");
      expect(err).toContain("bool");
    });
  });

  describe("params model (V9)", () => {
    it("marks paramsRequired when a required-by-default scalar param exists", () => {
      const method = buildMethod({
        requestFields: [repeatedScalar("ids", 1), singularScalar("filter", 2)],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity()],
        batch: batch({ entityKey: "id" }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.paramFields.map((f) => f.name)).toEqual(["filter"]);
      // A proto3 singular scalar is required under isRequiredField input
      // semantics (no proto3 `optional`, not a message/enum), so params are
      // required. This exercises V9 without needing behavior comments, which
      // are impractical to synthesize in an in-code FileDescriptorProto.
      expect(spec.paramsRequired).toBe(true);
    });

    it("leaves paramsRequired false when the only param is a message field", () => {
      const method = buildMethod({
        requestFields: [
          repeatedScalar("ids", 1),
          singularMessage("mask", 2, "Mask"),
        ],
        responseFields: [repeatedMessage("users", 1, "User")],
        extraMessages: [userEntity(), messageProto("Mask", [])],
        batch: batch({ entityKey: "id" }),
      });
      const spec = expectOk(resolveBatchSpec(method));
      expect(spec.paramFields.map((f) => f.name)).toEqual(["mask"]);
      expect(spec.paramsRequired).toBe(false);
    });
  });
});
