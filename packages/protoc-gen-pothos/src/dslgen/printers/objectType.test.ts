import { createFileRegistry } from "@bufbuild/protobuf";
import {
  ObjectType,
  type TypeOptions,
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createObjectTypeCode } from "./objectType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateObjectTypeCode(
  packageName: TestapisPackage,
  messageTypeName: string,
  options: PothosPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping:
      options.protobuf === "ts-proto"
        ? defaultScalarMappingForTsProto
        : defaultScalarMapping,
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
  describe("ts-proto", () => {
    const options: PothosPrinterOptions = {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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

    test("generates code for empty message", () => {
      const code = generateObjectTypeCode(
        "testapis.empty_types",
        "EmptyMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested types", () => {
      const code = generateObjectTypeCode(
        "testapis.nested",
        "ParentMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });

  describe("protobuf-es", () => {
    const options: PothosPrinterOptions = {
      dsl: "pothos",
      protobuf: "protobuf-es" as const,
      importPrefix: "@testapis/protobuf-es",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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
    const options: PothosPrinterOptions = {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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
