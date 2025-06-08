import { createFileRegistry } from "@bufbuild/protobuf";
import {
  ObjectType,
  type TypeOptions,
  defaultScalarMapping,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createObjectTypeCode } from "./objectType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateObjectTypeCode(
  packageName: TestapisPackage,
  messageTypeName: string,
  options: NexusPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  const descMsg = registry.getMessage(`${packageName}.${messageTypeName}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${messageTypeName} not found in package ${packageName}`,
    );
  }

  const objType = new ObjectType(descMsg, typeOptions);

  const code = createObjectTypeCode(objType, registry, options);

  return code.toString();
}

describe("createObjectTypeCode", () => {
  describe("google-protobuf", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple message", () => {
      const code = generateObjectTypeCode(
        "testapis.primitives",
        "Primitives",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with nested fields", () => {
      const code = generateObjectTypeCode(
        "testapis.primitives",
        "Message",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });

  describe("protobufjs", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "protobufjs" as const,
      importPrefix: "@testapis/protobufjs",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple message", () => {
      const code = generateObjectTypeCode(
        "testapis.primitives",
        "Primitives",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with nested fields", () => {
      const code = generateObjectTypeCode(
        "testapis.primitives",
        "Message",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with oneofs", () => {
      const code = generateObjectTypeCode(
        "testapis.oneof",
        "OneofParent",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });

  describe("with extensions", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for message with field extensions", () => {
      const code = generateObjectTypeCode(
        "testapis.extensions",
        "PrefixedMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });
});
