import {
  create,
  createFileRegistry,
  type DescFile,
  type MessageInitShape,
  setExtension,
} from "@bufbuild/protobuf";
import {
  type DescriptorProto,
  DescriptorProtoSchema,
  type EnumDescriptorProto,
  EnumDescriptorProtoSchema,
  EnumValueDescriptorProtoSchema,
  type FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FieldDescriptorProtoSchema,
  FileDescriptorProtoSchema,
  type FileOptions,
  FileOptionsSchema,
  file_google_protobuf_empty,
  type MessageOptions,
  MessageOptionsSchema,
  MethodDescriptorProtoSchema,
  type MethodOptions,
  MethodOptions_IdempotencyLevel,
  MethodOptionsSchema,
  OneofDescriptorProtoSchema,
  ServiceDescriptorProtoSchema,
  type ServiceOptions,
  ServiceOptionsSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import { InputObjectType } from "./InputObjectType.js";
import { ObjectType } from "./ObjectType.js";
import {
  collectOperationsFromFile,
  fileHasOptedInServices,
  type OperationCollectionResult,
  type OperationField,
} from "./operationField.js";
import { defaultScalarMapping, type TypeOptions } from "./options.js";

const PKG = "codegen_core.operation_test";
const T = FieldDescriptorProto_Type;
const OPTIONAL = FieldDescriptorProto_Label.OPTIONAL;
const EMPTY_TYPE = ".google.protobuf.Empty";

const OPTIONS: TypeOptions = {
  partialInputs: false,
  scalarMapping: { ...defaultScalarMapping },
  ignoreNonMessageOneofFields: false,
};

function scalar(
  name: string,
  n: number,
  type = T.STRING,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type,
    label: OPTIONAL,
  });
}
function optionalScalar(
  name: string,
  n: number,
  type = T.STRING,
): FieldDescriptorProto {
  // proto3 `optional` compiles to a synthetic oneof; the descriptor carries
  // proto3Optional and a matching oneofIndex.
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type,
    label: OPTIONAL,
    proto3Optional: true,
    oneofIndex: 0,
  });
}
function messageField(
  name: string,
  n: number,
  msg: string,
  label = OPTIONAL,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type: T.MESSAGE,
    label,
    typeName: `.${PKG}.${msg}`,
  });
}
function enumField(name: string, n: number, en: string): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type: T.ENUM,
    label: OPTIONAL,
    typeName: `.${PKG}.${en}`,
  });
}
function oneofMemberField(
  name: string,
  n: number,
  msg: string,
  oneofIndex: number,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type: T.MESSAGE,
    label: OPTIONAL,
    typeName: `.${PKG}.${msg}`,
    oneofIndex,
  });
}

type MsgOpts = { objectTypeIgnore?: boolean; inputTypeIgnore?: boolean };

function messageProto(
  name: string,
  fields: FieldDescriptorProto[],
  opts?: MsgOpts & { oneofNames?: string[] },
): DescriptorProto {
  let options: MessageOptions | undefined;
  if (opts?.objectTypeIgnore || opts?.inputTypeIgnore) {
    options = create(MessageOptionsSchema, {});
    if (opts.objectTypeIgnore) {
      setExtension(
        options,
        extensions.object_type,
        create(extensions.GraphqlObjectTypeOptionsSchema, { ignore: true }),
      );
    }
    if (opts.inputTypeIgnore) {
      setExtension(
        options,
        extensions.input_type,
        create(extensions.GraphqlInputTypeOptionsSchema, { ignore: true }),
      );
    }
  }
  return create(DescriptorProtoSchema, {
    name,
    field: fields,
    options,
    oneofDecl: (opts?.oneofNames ?? []).map((n) =>
      create(OneofDescriptorProtoSchema, { name: n }),
    ),
  });
}

function enumProto(name: string, values: string[]): EnumDescriptorProto {
  return create(EnumDescriptorProtoSchema, {
    name,
    value: values.map((v, i) =>
      create(EnumValueDescriptorProtoSchema, { name: v, number: i }),
    ),
  });
}

interface MethodSpec {
  name: string;
  request?: DescriptorProto | "empty";
  response?: DescriptorProto | "empty";
  rpc?: MessageInitShape<typeof extensions.GraphqlRpcOptionsSchema>;
  idempotency?: MethodOptions_IdempotencyLevel;
  streaming?: "client" | "server" | "bidi";
  deprecated?: boolean;
}

function build(params: {
  service?: "absent" | "no-ext" | "opted-in";
  serviceIgnore?: boolean;
  methods: MethodSpec[];
  extraMessages?: DescriptorProto[];
  extraEnums?: EnumDescriptorProto[];
  schemaOptions?: MessageInitShape<
    typeof extensions.GraphqlSchemaOptionsSchema
  >;
}): { file: DescFile; files: readonly DescFile[] } {
  const messages: DescriptorProto[] = [];
  const methodProtos = params.methods.map((m) => {
    let inputType: string;
    let outputType: string;

    if (m.request === "empty") {
      inputType = EMPTY_TYPE;
    } else {
      const req = m.request ?? messageProto(`${m.name}Request`, []);
      messages.push(req);
      inputType = `.${PKG}.${req.name}`;
    }
    if (m.response === "empty") {
      outputType = EMPTY_TYPE;
    } else {
      const res = m.response ?? messageProto(`${m.name}Response`, []);
      messages.push(res);
      outputType = `.${PKG}.${res.name}`;
    }

    let options: MethodOptions | undefined;
    if (m.rpc != null || m.idempotency != null || m.deprecated) {
      options = create(MethodOptionsSchema, {
        idempotencyLevel: m.idempotency,
        deprecated: m.deprecated ?? false,
      });
      if (m.rpc != null) {
        setExtension(
          options,
          extensions.rpc,
          create(extensions.GraphqlRpcOptionsSchema, m.rpc),
        );
      }
    }

    return create(MethodDescriptorProtoSchema, {
      name: m.name,
      inputType,
      outputType,
      options,
      clientStreaming: m.streaming === "client" || m.streaming === "bidi",
      serverStreaming: m.streaming === "server" || m.streaming === "bidi",
    });
  });

  let serviceOptions: ServiceOptions | undefined;
  if (params.service === "no-ext") {
    serviceOptions = create(ServiceOptionsSchema, {});
  } else if ((params.service ?? "opted-in") === "opted-in") {
    serviceOptions = create(ServiceOptionsSchema, {});
    setExtension(
      serviceOptions,
      extensions.service,
      create(extensions.GraphqlServiceOptionsSchema, {
        ignore: params.serviceIgnore ?? false,
      }),
    );
  }

  let fileOptions: FileOptions | undefined;
  if (params.schemaOptions != null) {
    fileOptions = create(FileOptionsSchema, {});
    setExtension(
      fileOptions,
      extensions.schema,
      create(extensions.GraphqlSchemaOptionsSchema, params.schemaOptions),
    );
  }

  const usesEmpty = params.methods.some(
    (m) => m.request === "empty" || m.response === "empty",
  );

  const fileProto = create(FileDescriptorProtoSchema, {
    name: "operation_test.proto",
    package: PKG,
    syntax: "proto3",
    dependency: [
      "graphql/schema.proto",
      ...(usesEmpty ? ["google/protobuf/empty.proto"] : []),
    ],
    options: fileOptions,
    messageType: [...messages, ...(params.extraMessages ?? [])],
    enumType: params.extraEnums ?? [],
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "TestService",
        options: serviceOptions,
        method: methodProtos,
      }),
    ],
  });

  const registry = createFileRegistry(fileProto, (name) => {
    if (name === "graphql/schema.proto") return extensions.file_graphql_schema;
    if (name === "google/protobuf/empty.proto") {
      return file_google_protobuf_empty;
    }
    return undefined;
  });
  const file = registry.getFile("operation_test.proto");
  if (file == null) throw new Error("operation_test.proto not found");
  return { file, files: [...registry.files] };
}

function collect(
  params: Parameters<typeof build>[0],
): OperationCollectionResult {
  const { file, files } = build(params);
  return collectOperationsFromFile(file, OPTIONS, files);
}

function only(result: OperationCollectionResult): OperationField {
  expect(result.errors).toEqual([]);
  expect(result.operations).toHaveLength(1);
  return result.operations[0];
}

describe("collectOperationsFromFile", () => {
  describe("R1.1: opt-in selection", () => {
    it("skips a service with no options at all (absent)", () => {
      const result = collect({
        service: "absent",
        methods: [{ name: "GetUser" }],
      });
      expect(result.operations).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("skips a service whose options are set but carry no (graphql.service)", () => {
      const result = collect({
        service: "no-ext",
        methods: [{ name: "GetUser" }],
      });
      expect(result.operations).toEqual([]);
    });

    it("includes a service with an empty (graphql.service) = {} (presence opts in)", () => {
      const result = collect({
        service: "opted-in",
        methods: [{ name: "GetUser" }],
      });
      expect(result.operations).toHaveLength(1);
    });

    it("skips the whole service when (graphql.service).ignore = true", () => {
      const result = collect({
        service: "opted-in",
        serviceIgnore: true,
        methods: [{ name: "GetUser" }],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe("R1.2: per-RPC ignore", () => {
    it("skips an RPC with (graphql.rpc).ignore = true", () => {
      const result = collect({
        methods: [
          { name: "GetUser", rpc: { ignore: true } },
          { name: "ListUsers" },
        ],
      });
      expect(result.operations.map((o) => o.name)).toEqual(["listUsers"]);
    });
  });

  describe("R1.3: streaming", () => {
    it("skips a streaming RPC with a warning", () => {
      const result = collect({
        methods: [{ name: "Watch", streaming: "server" }],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain("Skipping TestService.Watch");
      expect(result.warnings[0]).toContain("server_streaming");
    });

    it("errors when a streaming RPC explicitly sets operation", () => {
      const result = collect({
        methods: [
          {
            name: "Watch",
            streaming: "bidi",
            rpc: { operation: extensions.GraphqlOperation.QUERY },
          },
        ],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("(graphql.rpc).operation is set");
      expect(result.errors[0]).toContain("bidi_streaming");
    });
  });

  describe("R2: operation kind", () => {
    it("defaults to mutation", () => {
      expect(only(collect({ methods: [{ name: "CreateUser" }] })).kind).toBe(
        "mutation",
      );
    });

    it("maps NO_SIDE_EFFECTS to query", () => {
      const op = only(
        collect({
          methods: [
            {
              name: "GetUser",
              idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
            },
          ],
        }),
      );
      expect(op.kind).toBe("query");
    });

    it("honours an explicit operation = QUERY even for a side-effecting RPC", () => {
      const op = only(
        collect({
          methods: [
            {
              name: "DoThing",
              rpc: { operation: extensions.GraphqlOperation.QUERY },
            },
          ],
        }),
      );
      expect(op.kind).toBe("query");
    });

    it("honours an explicit operation = MUTATION over NO_SIDE_EFFECTS", () => {
      const op = only(
        collect({
          methods: [
            {
              name: "GetUser",
              idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
              rpc: { operation: extensions.GraphqlOperation.MUTATION },
            },
          ],
        }),
      );
      expect(op.kind).toBe("mutation");
    });
  });

  describe("R3: field name", () => {
    it("defaults to camelCase of the RPC name", () => {
      expect(only(collect({ methods: [{ name: "GetUser" }] })).name).toBe(
        "getUser",
      );
    });

    it("is overridden by (graphql.rpc).name", () => {
      const op = only(
        collect({ methods: [{ name: "GetUser", rpc: { name: "viewer" } }] }),
      );
      expect(op.name).toBe("viewer");
    });
  });

  describe("R4.1: query flatten args", () => {
    it("flattens request fields into args (scalar/optional/message/enum/oneof)", () => {
      const req = messageProto(
        "GetThingRequest",
        [
          scalar("user_id", 1),
          optionalScalar("nickname", 2),
          messageField("filter", 3, "Filter"),
          enumField("kind", 4, "Kind"),
          oneofMemberField("by_email", 5, "Filter", 1),
          oneofMemberField("by_phone", 6, "Filter", 1),
        ],
        { oneofNames: ["nickname", "target"] },
      );
      const result = collect({
        methods: [
          {
            name: "GetThing",
            request: req,
            idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
          },
        ],
        extraMessages: [messageProto("Filter", [scalar("q", 1)])],
        extraEnums: [enumProto("Kind", ["KIND_UNSPECIFIED", "KIND_A"])],
      });
      const op = only(result);
      expect(op.kind).toBe("query");
      if (op.args.kind !== "flatten") throw new Error("expected flatten args");

      const byName = new Map(op.args.args.map((a) => [a.name, a]));
      expect([...byName.keys()].sort()).toEqual(
        ["byEmail", "byPhone", "filter", "kind", "nickname", "userId"].sort(),
      );
      // proto3 singular scalar -> required (non-null)
      expect(byName.get("userId")?.isNullable()).toBe(false);
      // proto3 optional scalar -> nullable
      expect(byName.get("nickname")?.isNullable()).toBe(true);
      // message-typed arg references the field message's Input type
      expect(byName.get("filter")?.type).toBeInstanceOf(InputObjectType);
      // oneof members flatten to individual nullable args (no XOR enforcement)
      expect(byName.get("byEmail")?.isNullable()).toBe(true);
      expect(byName.get("byPhone")?.isNullable()).toBe(true);
    });

    it("errors when a message-typed arg's Input type is ignored", () => {
      const req = messageProto("GetThingRequest", [
        messageField("filter", 1, "Filter"),
      ]);
      const result = collect({
        methods: [
          {
            name: "GetThing",
            request: req,
            idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
          },
        ],
        extraMessages: [
          messageProto("Filter", [scalar("q", 1)], { inputTypeIgnore: true }),
        ],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('field "filter"');
      expect(result.errors[0]).toContain("Input type is not generated");
    });
  });

  describe("R4.2: mutation single input", () => {
    it("uses a single input arg referencing the request Input type", () => {
      const op = only(collect({ methods: [{ name: "CreateUser" }] }));
      expect(op.kind).toBe("mutation");
      if (op.args.kind !== "input") throw new Error("expected input args");
      expect(op.args.type).toBeInstanceOf(InputObjectType);
      expect(op.args.type.typeName).toBe("CreateUserRequestInput");
    });

    it("errors when the request Input type is ignored (input_type.ignore)", () => {
      const req = messageProto("CreateUserRequest", [scalar("name", 1)], {
        inputTypeIgnore: true,
      });
      const result = collect({
        methods: [{ name: "CreateUser", request: req }],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Cannot generate a mutation");
      expect(result.errors[0]).toContain("requests_as_inputs");
    });

    it("errors when the request is filtered out by ignore_requests", () => {
      const result = collect({
        methods: [{ name: "CreateUser" }],
        schemaOptions: { ignoreRequests: true },
      });
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Cannot generate a mutation");
    });
  });

  describe("R5.3: default object return", () => {
    it("returns the response message ObjectType, non-null", () => {
      const op = only(collect({ methods: [{ name: "GetUser" }] }));
      expect(op.returnType.kind).toBe("object");
      if (op.returnType.kind !== "object") throw new Error("unreachable");
      expect(op.returnType.type).toBeInstanceOf(ObjectType);
      expect(op.returnType.type.typeName).toBe("GetUserResponse");
      expect(op.nullable).toBe(false);
    });

    it("errors when the response Object type is ignored and no expose_field", () => {
      const res = messageProto("GetUserResponse", [scalar("id", 1)], {
        objectTypeIgnore: true,
      });
      const result = collect({
        methods: [{ name: "GetUser", response: res }],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("no generated Object type");
      expect(result.errors[0]).toContain("responses_as_payloads");
    });
  });

  describe("R5.4: expose_field", () => {
    it("unwraps the named response field (message -> its ObjectType)", () => {
      const res = messageProto("GetUserResponse", [
        messageField("user", 1, "User"),
      ]);
      const result = collect({
        methods: [
          { name: "GetUser", response: res, rpc: { exposeField: "user" } },
        ],
        extraMessages: [messageProto("User", [scalar("id", 1)])],
      });
      const op = only(result);
      expect(op.returnType.kind).toBe("exposeField");
      if (op.returnType.kind !== "exposeField") throw new Error("unreachable");
      expect(op.returnType.field.type).toBeInstanceOf(ObjectType);
      expect(op.returnType.field.proto.name).toBe("user");
      // singular message field -> nullable output
      expect(op.nullable).toBe(true);
    });

    it("errors with available field names when expose_field is unknown", () => {
      const res = messageProto("GetUserResponse", [
        messageField("user", 1, "User"),
        scalar("etag", 2),
      ]);
      const result = collect({
        methods: [
          { name: "GetUser", response: res, rpc: { exposeField: "nope" } },
        ],
        extraMessages: [messageProto("User", [scalar("id", 1)])],
      });
      expect(result.operations).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('refers to "nope"');
      expect(result.errors[0]).toContain('"user"');
      expect(result.errors[0]).toContain('"etag"');
    });
  });

  describe("R5.5: google.protobuf.Empty", () => {
    it("maps an Empty request to zero args", () => {
      const op = only(
        collect({
          methods: [
            {
              name: "Ping",
              request: "empty",
              idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
            },
          ],
        }),
      );
      expect(op.args.kind).toBe("none");
    });

    it("maps an Empty request to zero args even for a mutation", () => {
      const op = only(
        collect({ methods: [{ name: "Reset", request: "empty" }] }),
      );
      expect(op.kind).toBe("mutation");
      expect(op.args.kind).toBe("none");
    });

    it("maps an Empty response to a non-null Boolean", () => {
      const op = only(
        collect({ methods: [{ name: "DeleteUser", response: "empty" }] }),
      );
      expect(op.returnType.kind).toBe("boolean");
      expect(op.nullable).toBe(false);
    });
  });

  describe("deprecation", () => {
    it("carries a deprecation reason for a deprecated RPC", () => {
      const op = only(
        collect({ methods: [{ name: "GetUser", deprecated: true }] }),
      );
      expect(op.deprecationReason).toContain("TestService.GetUser");
      expect(op.deprecationReason).toContain("deprecated");
    });

    it("has a null deprecation reason otherwise", () => {
      const op = only(collect({ methods: [{ name: "GetUser" }] }));
      expect(op.deprecationReason).toBeNull();
    });
  });

  describe("aggregation", () => {
    it("collects operations across RPCs and aggregates independent errors", () => {
      const res = messageProto("GetUserResponse", [scalar("id", 1)], {
        objectTypeIgnore: true,
      });
      const result = collect({
        methods: [
          {
            name: "ListUsers",
            idempotency: MethodOptions_IdempotencyLevel.NO_SIDE_EFFECTS,
          },
          { name: "GetUser", response: res },
          { name: "CreateUser" },
        ],
      });
      expect(result.operations.map((o) => o.name).sort()).toEqual([
        "createUser",
        "listUsers",
      ]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("GetUser");
    });
  });
});

describe("fileHasOptedInServices", () => {
  it("is false when no service carries (graphql.service)", () => {
    const { file } = build({
      service: "no-ext",
      methods: [{ name: "GetUser" }],
    });
    expect(fileHasOptedInServices(file)).toBe(false);
  });

  it("is true when a service carries (graphql.service), even if ignored", () => {
    const { file } = build({
      service: "opted-in",
      serviceIgnore: true,
      methods: [{ name: "GetUser" }],
    });
    expect(fileHasOptedInServices(file)).toBe(true);
  });
});
