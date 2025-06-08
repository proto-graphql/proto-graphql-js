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

function generateInputObjectTypeCode(packageName: TestapisPackage, typeName: string, options: PothosPrinterOptions, partialInputs = false): string {
  const typeOptions: TypeOptions = {
    partialInputs,
    scalarMapping: options.protobuf === "ts-proto" ? defaultScalarMappingForTsProto : defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const req = buildCodeGeneratorRequest(packageName);
  
  // We need to run through the plugin to get a proper Schema
  let result = "";
  const plugin = createEcmaScriptPlugin({
    name: "test-plugin",
    version: "v1.0.0",
    generateTs: (schema) => {
      const registry = createRegistryFromSchema(schema);
      
      // Find the target file
      const targetFile = schema.allFiles.find(f => f.name.includes(packageName.split('.')[1]));
      if (!targetFile) throw new Error(`File for ${packageName} not found`);
      
      // Collect types from the file
      const types = collectTypesFromFile(targetFile, typeOptions, schema.allFiles);
      
      const inputType = types.find(t => t.typeName === typeName && t instanceof InputObjectType) as InputObjectType;
      if (!inputType) throw new Error(`${typeName} type not found`);

      result = createInputObjectTypeCode(inputType, registry, options).toString();
    },
    parseOptions: parsePothosOptions,
  });
  
  plugin.run(req);
  return result;
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
      const code = generateInputObjectTypeCode("testapis.primitives", "PrimitivesInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "MessageInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode("testapis.oneof", "OneofParentInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode("testapis.empty_types", "EmptyMessageInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested input types", () => {
      const code = generateInputObjectTypeCode("testapis.nested", "ParentMessageInput", options);
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
      const code = generateInputObjectTypeCode("testapis.primitives", "PrimitivesInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with nested fields", () => {
      const code = generateInputObjectTypeCode("testapis.primitives", "MessageInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an input object with oneof fields", () => {
      const code = generateInputObjectTypeCode("testapis.oneof", "OneofParentInput", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty input object", () => {
      const code = generateInputObjectTypeCode("testapis.empty_types", "EmptyMessageInput", options);
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
      const code = generateInputObjectTypeCode("testapis.primitives", "MessagePartialInput", options, true);
      expect(code).toMatchSnapshot();
    });
  });
});