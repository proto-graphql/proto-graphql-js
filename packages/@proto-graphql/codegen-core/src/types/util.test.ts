import { create, createFileRegistry, setExtension } from "@bufbuild/protobuf";
import {
  DescriptorProtoSchema,
  FileDescriptorProtoSchema,
  MethodDescriptorProtoSchema,
  type MethodOptions,
  MethodOptionsSchema,
  ServiceDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import {
  getTestapisFileDescriptorSet,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { describe, expect, it } from "vitest";
import * as extensions from "../__generated__/extensions/graphql/schema_pb.js";
import {
  exceptRequestOrResponse,
  getRpcOptions,
  isRequiredField,
} from "./util";

describe("isRequiredField", () => {
  it.each<{
    context: string;
    pkg: TestapisPackage;
    typeName: string;
    fieldName: string;
    fieldType: "output" | "input" | "partial_input";
    want: boolean;
  }>([
    {
      context: "comment starts with `Requried.`",
      pkg: "testapis.behavior.field_comments",
      typeName: "FieldBehaviorCommentsMessage",
      fieldName: "requiredField",
      fieldType: "output",
      want: true,
    },
    {
      context: "comment contains `Requried.`",
      pkg: "testapis.behavior.field_comments",
      typeName: "FieldBehaviorCommentsMessage",
      fieldName: "outputOnlyRequiredField",
      fieldType: "output",
      want: true,
    },
    {
      context: "comment does not contain `Requried.`",
      pkg: "testapis.behavior.field_comments",
      typeName: "FieldBehaviorCommentsMessage",
      fieldName: "outputOnlyField",
      fieldType: "output",
      want: false,
    },
    {
      context: "field is primitive",
      pkg: "testapis.basic.presence",
      typeName: "Message",
      fieldName: "requiredStringValue",
      fieldType: "output",
      want: true,
    },
    {
      context: "field is primitive but optional",
      pkg: "testapis.basic.presence",
      typeName: "Message",
      fieldName: "optionalStringValue",
      fieldType: "output",
      want: false,
    },
    {
      context: "field is primitive but input_nullability is NULLABLE",
      pkg: "testapis.options.field_nullability",
      typeName: "Message",
      fieldName: "userId",
      fieldType: "input",
      want: false,
    },
    {
      context: "field is enum but output_nullability is NULLABLE",
      pkg: "testapis.options.field_nullability",
      typeName: "Message",
      fieldName: "status",
      fieldType: "output",
      want: false,
    },
  ])("returns $want for $fieldType field when $context", ({
    pkg,
    typeName,
    fieldName,
    fieldType,
    want,
  }) => {
    const fds = getTestapisFileDescriptorSet(pkg);
    const registry = createFileRegistry(fds);
    const qualifiedName = `${pkg}.${typeName}`;
    const msgDesc = registry.getMessage(qualifiedName);
    if (msgDesc == null) {
      throw new Error(`${qualifiedName} not found`);
    }
    const fieldDesc = msgDesc.field[fieldName];
    if (fieldDesc == null) {
      throw new Error(`${qualifiedName}.${fieldName} not found`);
    }

    expect(isRequiredField(fieldDesc, fieldType)).toBe(want);
  });
});

describe("exceptRequestOrResponse", () => {
  const files = [
    ...createFileRegistry(
      getTestapisFileDescriptorSet("testapis.basic.presence"),
    ).files,
  ];

  it("returns the same predicate instance for the same files array (memoized)", () => {
    expect(exceptRequestOrResponse(files)).toBe(exceptRequestOrResponse(files));
  });

  it("builds a separate predicate for a different files array", () => {
    expect(exceptRequestOrResponse([...files])).not.toBe(
      exceptRequestOrResponse([...files]),
    );
  });

  it("keeps messages that are not ignored request/response types", () => {
    const registry = createFileRegistry(
      getTestapisFileDescriptorSet("testapis.basic.presence"),
    );
    const msg = registry.getMessage("testapis.basic.presence.Message");
    if (msg == null) {
      throw new Error("testapis.basic.presence.Message not found");
    }
    expect(exceptRequestOrResponse(files)(msg)).toBe(true);
  });
});

// `(graphql.rpc)` is not part of any `@proto-graphql/testapis-proto` fixture
// yet (adding one requires regenerating the testapis FileDescriptorSet,
// which is out of scope here). Build a minimal FileDescriptorProto with a
// service/method in-code instead, resolving its `graphql/schema.proto`
// dependency straight from the generated extensions module.
function buildServiceRegistry(options?: { methodOptions?: MethodOptions }) {
  const fileProto = create(FileDescriptorProtoSchema, {
    name: "util_test_service.proto",
    package: "codegen_core.util_test",
    syntax: "proto3",
    dependency: ["graphql/schema.proto"],
    messageType: [
      create(DescriptorProtoSchema, { name: "TestRequest" }),
      create(DescriptorProtoSchema, { name: "TestResponse" }),
    ],
    service: [
      create(ServiceDescriptorProtoSchema, {
        name: "TestService",
        method: [
          create(MethodDescriptorProtoSchema, {
            name: "TestMethod",
            inputType: ".codegen_core.util_test.TestRequest",
            outputType: ".codegen_core.util_test.TestResponse",
            options: options?.methodOptions,
          }),
        ],
      }),
    ],
  });

  return createFileRegistry(fileProto, (name) =>
    name === "graphql/schema.proto"
      ? extensions.file_graphql_schema
      : undefined,
  );
}

describe("getRpcOptions", () => {
  it("returns the EMPTY singleton when the RPC has no (graphql.rpc) option", () => {
    const registry = buildServiceRegistry();
    const svc = registry.getService("codegen_core.util_test.TestService");
    if (svc == null) throw new Error("TestService not found");

    expect(getRpcOptions(svc.methods[0])).toEqual(
      create(extensions.GraphqlRpcOptionsSchema, {}),
    );
  });

  it("returns the parsed options, including nested batch options, when (graphql.rpc) is set", () => {
    const methodOptions = create(MethodOptionsSchema, {});
    setExtension(
      methodOptions,
      extensions.rpc,
      create(extensions.GraphqlRpcOptionsSchema, {
        name: "customName",
        operation: extensions.GraphqlOperation.MUTATION,
        batch: create(extensions.GraphqlRpcBatchOptionsSchema, {
          group: true,
          entityKey: "userId",
        }),
      }),
    );
    const registry = buildServiceRegistry({ methodOptions });
    const svc = registry.getService("codegen_core.util_test.TestService");
    if (svc == null) throw new Error("TestService not found");

    const opts = getRpcOptions(svc.methods[0]);
    expect(opts.name).toBe("customName");
    expect(opts.operation).toBe(extensions.GraphqlOperation.MUTATION);
    expect(opts.batch?.group).toBe(true);
    expect(opts.batch?.entityKey).toBe("userId");
  });
});
