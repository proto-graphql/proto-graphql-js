import { createFileRegistry } from "@bufbuild/protobuf";
import {
  InputObjectType,
  type TypeOptions,
  defaultScalarMapping,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateInputObjectTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  options: NexusPrinterOptions,
  partialInputs = false,
): string {
  const typeOptions: TypeOptions = {
    partialInputs,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${typeNameInProto} not found in package ${packageName}`,
    );
  }

  const inputType = new InputObjectType(descMsg, typeOptions);

  const code = createInputObjectTypeCode(
    partialInputs ? inputType.toPartialInput() : inputType,
    registry,
    options,
  );

  return code.toString();
}

describe("createInputObjectTypeCode", () => {
  describe("google-protobuf", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple input object", () => {
      const code = generateInputObjectTypeCode(
        "testapis.primitives",
        "Primitives",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode(
        "testapis.primitives",
        "Message",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode(
        "testapis.oneof",
        "OneofParent",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode(
        "testapis.empty_types",
        "EmptyMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested input types", () => {
      const code = generateInputObjectTypeCode(
        "testapis.nested",
        "ParentMessage",
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

    test("generates code for a simple input object", () => {
      const code = generateInputObjectTypeCode(
        "testapis.primitives",
        "Primitives",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode(
        "testapis.primitives",
        "Message",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode(
        "testapis.oneof",
        "OneofParent",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode(
        "testapis.empty_types",
        "EmptyMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });

  describe("with partial inputs", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for partial input types", () => {
      const code = generateInputObjectTypeCode(
        "testapis.primitives",
        "Message",
        options,
        true,
      );
      expect(code).toMatchSnapshot();
    });
  });
});
