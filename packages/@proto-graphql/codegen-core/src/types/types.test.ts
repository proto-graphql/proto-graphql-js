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
  type FieldDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
  FieldDescriptorProtoSchema,
  FileDescriptorProtoSchema,
  type FileOptions,
  FileOptionsSchema,
  type MessageOptions,
  MessageOptionsSchema,
  MethodDescriptorProtoSchema,
  ServiceDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { describe, expect, it } from "vitest";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import { InputObjectType } from "./InputObjectType.js";
import { defaultScalarMapping, type TypeOptions } from "./options.js";
import { collectTypesFromFile, type GlType } from "./types.js";

// Tests for the `requests_as_inputs` / `responses_as_payloads` suffix
// transform (R5.1/R5.2, design.md §2/§7): naming (via `collectTypesFromFile`'s
// resulting `.typeName`s), generation filtering (which shapes are built), the
// `ignore_requests`/`ignore_responses` precedence, and the collision guard.
//
// `(graphql.rpc)` isn't part of any `@proto-graphql/testapis-proto` fixture
// (see util.test.ts's identical note), so build a minimal FileDescriptorProto
// with a service/method in-code — only enough of one is needed here to make
// a message match the
// request/response naming rule; the operation itself is not collected.

const PKG = "codegen_core.types_test";
const T = FieldDescriptorProto_Type;
const OPTIONAL = FieldDescriptorProto_Label.OPTIONAL;

const OPTIONS: TypeOptions = {
  partialInputs: false,
  scalarMapping: { ...defaultScalarMapping },
  ignoreNonMessageOneofFields: false,
};

function messageField(
  name: string,
  n: number,
  msg: string,
): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type: T.MESSAGE,
    label: OPTIONAL,
    typeName: `.${PKG}.${msg}`,
  });
}

function scalar(name: string, n: number): FieldDescriptorProto {
  return create(FieldDescriptorProtoSchema, {
    name,
    number: n,
    type: T.STRING,
    label: OPTIONAL,
  });
}

function messageProto(
  name: string,
  fields: FieldDescriptorProto[] = [],
  opts?: { objectTypeName?: string },
): DescriptorProto {
  let options: MessageOptions | undefined;
  if (opts?.objectTypeName != null) {
    options = create(MessageOptionsSchema, {});
    setExtension(
      options,
      extensions.object_type,
      create(extensions.GraphqlObjectTypeOptionsSchema, {
        name: opts.objectTypeName,
      }),
    );
  }
  return create(DescriptorProtoSchema, { name, field: fields, options });
}

function build(params: {
  messages: DescriptorProto[];
  methodName?: string;
  requestName?: string;
  responseName?: string;
  schemaOptions?: MessageInitShape<
    typeof extensions.GraphqlSchemaOptionsSchema
  >;
}): { file: DescFile; files: readonly DescFile[] } {
  const methodName = params.methodName ?? "CreateUser";
  const requestName = params.requestName ?? `${methodName}Request`;
  const responseName = params.responseName ?? `${methodName}Response`;

  let fileOptions: FileOptions | undefined;
  if (params.schemaOptions != null) {
    fileOptions = create(FileOptionsSchema, {});
    setExtension(
      fileOptions,
      extensions.schema,
      create(extensions.GraphqlSchemaOptionsSchema, params.schemaOptions),
    );
  }

  const fileProto = create(FileDescriptorProtoSchema, {
    name: "types_test.proto",
    package: PKG,
    syntax: "proto3",
    dependency: ["graphql/schema.proto"],
    options: fileOptions,
    messageType: params.messages,
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "TestService",
        method: [
          create(MethodDescriptorProtoSchema, {
            name: methodName,
            inputType: `.${PKG}.${requestName}`,
            outputType: `.${PKG}.${responseName}`,
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
  const file = registry.getFile("types_test.proto");
  if (file == null) throw new Error("types_test.proto not found");
  return { file, files: [...registry.files] };
}

function collect(params: Parameters<typeof build>[0]): GlType[] {
  const { file, files } = build(params);
  return collectTypesFromFile(file, OPTIONS, files);
}

// Accessing `.typeName` is what triggers the suffix transform (and its
// collision check) — `collectTypesFromFile` itself only builds the type
// instances lazily, see util.ts's `resolveSuffixTransform`.
function typeNames(types: GlType[]): string[] {
  return types.map((t) => t.typeName);
}

describe("requests_as_inputs", () => {
  it("renames the matched request to `<Base>Input` and drops its Object type", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { requestsAsInputs: true },
      }),
    );
    expect(names).toContain("CreateUserInput");
    expect(names).not.toContain("CreateUserRequestInput"); // no double "Input"
    expect(names).not.toContain("CreateUserRequest");
    expect(names).not.toContain("CreateUser");
    // the response is unaffected by requests_as_inputs alone
    expect(names).toContain("CreateUserResponse");
  });

  it("applies type_prefix on top of the transformed base name", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { requestsAsInputs: true, typePrefix: "Api" },
      }),
    );
    expect(names).toContain("ApiCreateUserInput");
    expect(names).not.toContain("CreateUserInput");
  });

  it("an explicit (graphql.object_type).name override wins over the transform", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest", [], { objectTypeName: "Foo" }),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { requestsAsInputs: true },
      }),
    );
    expect(names).toContain("FooInput");
    expect(names).not.toContain("CreateUserInput");
  });

  it("a field referencing the matched request picks up the transformed name", () => {
    const types = collect({
      messages: [
        messageProto("CreateUserRequest"),
        messageProto("CreateUserResponse"),
        messageProto("Wrapper", [messageField("req", 1, "CreateUserRequest")]),
      ],
      schemaOptions: { requestsAsInputs: true },
    });
    const wrapperInput = types.find(
      (t): t is InputObjectType =>
        t instanceof InputObjectType && t.typeName === "WrapperInput",
    );
    if (wrapperInput == null) throw new Error("WrapperInput not found");
    const reqField = wrapperInput.fields.find((f) => f.proto.name === "req");
    if (reqField == null) throw new Error("field `req` not found");
    expect(reqField.type).toBeInstanceOf(InputObjectType);
    expect((reqField.type as InputObjectType).typeName).toBe("CreateUserInput");
  });

  it("ignore_requests wins: the message is dropped entirely, not renamed", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { requestsAsInputs: true, ignoreRequests: true },
      }),
    );
    expect(names).not.toContain("CreateUserInput");
    expect(names).not.toContain("CreateUserRequestInput");
    expect(names).not.toContain("CreateUserRequest");
  });

  it("throws a clear collision error when the transformed name collides with an existing type", () => {
    // `buildObjectTypes`'s filtering already calls `isRequestAsInputOnly`
    // (types.ts), which resolves the transform (and its collision check) — so
    // this throws from `collect()` itself, before any `.typeName` is read.
    const run = () =>
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
          messageProto("CreateUserInput"), // pre-existing, unrelated message
        ],
        schemaOptions: { requestsAsInputs: true },
      });
    expect(run).toThrow(/collides/);
    expect(run).toThrow(/CreateUserRequest/);
    expect(run).toThrow(/CreateUserInput/);
  });
});

describe("responses_as_payloads", () => {
  it("renames the matched response to `<Base>Payload` and drops its Input type", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { responsesAsPayloads: true },
      }),
    );
    expect(names).toContain("CreateUserPayload");
    expect(names).not.toContain("CreateUserResponseInput");
    expect(names).not.toContain("CreateUserPayloadInput");
    // the request is unaffected by responses_as_payloads alone
    expect(names).toContain("CreateUserRequestInput");
  });

  it("applies type_prefix on top of the transformed (already complete) name", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { responsesAsPayloads: true, typePrefix: "Api" },
      }),
    );
    expect(names).toContain("ApiCreateUserPayload");
  });

  it("an explicit (graphql.object_type).name override wins over the transform", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse", [], { objectTypeName: "Bar" }),
        ],
        schemaOptions: { responsesAsPayloads: true },
      }),
    );
    expect(names).toContain("Bar");
    expect(names).not.toContain("CreateUserPayload");
  });

  it("ignore_responses wins: the message is dropped entirely, not renamed", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
        ],
        schemaOptions: { responsesAsPayloads: true, ignoreResponses: true },
      }),
    );
    expect(names).not.toContain("CreateUserPayload");
    expect(names).not.toContain("CreateUserResponse");
  });

  it("throws a clear collision error when the transformed name collides with an existing type", () => {
    const run = () =>
      collect({
        messages: [
          messageProto("CreateUserRequest"),
          messageProto("CreateUserResponse"),
          messageProto("CreateUserPayload"), // pre-existing, unrelated message
        ],
        schemaOptions: { responsesAsPayloads: true },
      });
    expect(run).toThrow(/collides/);
  });
});

// Sanity check unrelated to any request/response matching: with neither
// option set, an ordinary message with fields keeps generating both an
// ordinary Input type ignored request/response — regression guard that this
// test file's fixtures behave as expected absent the feature under test.
describe("no transform option set", () => {
  it("keeps the default naming for request/response messages", () => {
    const names = typeNames(
      collect({
        messages: [
          messageProto("CreateUserRequest", [scalar("name", 1)]),
          messageProto("CreateUserResponse"),
        ],
      }),
    );
    expect(names).toContain("CreateUserRequestInput");
    expect(names).toContain("CreateUserResponse");
  });
});
