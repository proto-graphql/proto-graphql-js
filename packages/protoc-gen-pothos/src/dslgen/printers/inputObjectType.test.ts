import { getTestapisFileDescriptorSet, TestapisPackage, buildCodeGeneratorRequest } from "@proto-graphql/testapis-proto";
import {
  InputObjectType,
  ObjectType,
  TypeOptions,
  defaultScalarMappingForTsProto,
  defaultScalarMapping,
  collectTypesFromFile,
  createRegistryFromSchema
} from "@proto-graphql/codegen-core";
import { createFileRegistry } from "@bufbuild/protobuf";
import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { createTsGenerator, parsePothosOptions } from "@proto-graphql/protoc-plugin-helpers";
import { describe, expect, test } from "vitest";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateInputObjectTypeCode(packageName: TestapisPackage, typeNameInProto: string, options: PothosPrinterOptions, partialInputs = false): string {
  const typeOptions: TypeOptions = {
    partialInputs,
    scalarMapping: options.protobuf === "ts-proto" ? defaultScalarMappingForTsProto : defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet)
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(`Message ${typeNameInProto} not found in package ${packageName}`);
  }

  const inputType = new InputObjectType(descMsg, typeOptions);

  const code = createInputObjectTypeCode(partialInputs ? inputType.toPartialInput() : inputType, registry, options)

  return code.toString();
}

describe("createInputObjectTypeCode", () => {
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

    test("generates code for a simple input object", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "Primitives", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "Message", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode("testapis.oneof", "OneofParent", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode("testapis.empty_types", "EmptyMessage", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested input types", () => {
      const code = generateInputObjectTypeCode("testapis.nested", "ParentMessage", options);
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

    test("generates code for a simple input object", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "Primitives", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "Message", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode("testapis.oneof", "OneofParent", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode("testapis.empty_types", "EmptyMessage", options);
      expect(code).toMatchSnapshot();
    });
  });

  describe("with partial inputs", () => {
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

    test("generates code for partial input types", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "Message", options, true);
      expect(code).toMatchSnapshot();
    });
  });
});
