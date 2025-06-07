import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest } from "@proto-graphql/testapis-proto";
import { 
  InputObjectType, 
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parseNexusOptions } from "@proto-graphql/protoc-plugin-helpers";
import { code } from "ts-poet";
import { describe, expect, test } from "vitest";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import type { NexusPrinterOptions } from "./util.js";

// Helper to extract InputObjectType instances and generate code
function generateInputObjectTypeCode(packageName: string, typeName: string, options: NexusPrinterOptions) {
  const req = buildCodeGeneratorRequest(packageName);
  
  // Default type options
  const typeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };
  
  // Create a minimal plugin to get Schema
  const plugin = createEcmaScriptPlugin({
    name: "test-plugin",
    version: "v1.0.0",
    generateTs: createTsGenerator({
      generateFiles: (schema, file) => {
        // Just return, we only need the schema
      },
      dsl: "nexus",
    }),
    parseOptions: parseNexusOptions,
  });
  
  // Run the plugin to get the transformed schema
  const resp = plugin.run(req);
  
  // Now we need to recreate the schema to access its internals
  const testPlugin = createEcmaScriptPlugin({
    name: "test-plugin",
    version: "v1.0.0",
    generateTs: (schema) => {
      const registry = createRegistryFromSchema(schema);
      
      // Find the target file
      const targetFile = schema.allFiles.find(f => f.name.includes(packageName.split('.')[1]));
      if (!targetFile) throw new Error(`File for ${packageName} not found`);
      
      const types = collectTypesFromFile(targetFile, typeOptions, schema.allFiles);
      const inputType = types.find(t => t.typeName === typeName && t instanceof InputObjectType) as InputObjectType;
      if (!inputType) throw new Error(`${typeName} type not found`);
      
      const generatedCode = createInputObjectTypeCode(inputType, registry, options);
      
      // Store the result for testing
      (global as any).testResult = generatedCode.toString();
    },
    parseOptions: parseNexusOptions,
  });
  
  testPlugin.run(req);
  
  const result = (global as any).testResult;
  delete (global as any).testResult;
  return result;
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
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for partial input types", () => {
      const req = buildCodeGeneratorRequest("testapis.primitives");
      
      // Create type options with partialInputs enabled
      const typeOptions = {
        partialInputs: true,
        scalarMapping: defaultScalarMapping,
        ignoreNonMessageOneofFields: false,
      };
      
      const testPlugin = createEcmaScriptPlugin({
        name: "test-plugin",
        version: "v1.0.0",
        generateTs: (schema) => {
          const registry = createRegistryFromSchema(schema);
          
          const targetFile = schema.allFiles.find(f => f.name.includes("primitives"));
          if (!targetFile) throw new Error(`File for primitives not found`);
          
          const types = collectTypesFromFile(targetFile, typeOptions, schema.allFiles);
          const partialInputType = types.find(t => t.typeName === "MessagePartialInput" && t instanceof InputObjectType) as InputObjectType;
          if (!partialInputType) throw new Error(`MessagePartialInput type not found`);
          
          const generatedCode = createInputObjectTypeCode(partialInputType, registry, options);
          
          // Store the result for testing
          (global as any).testResult = generatedCode.toString();
        },
        parseOptions: parseNexusOptions,
      });
      
      testPlugin.run(req);
      
      const result = (global as any).testResult;
      delete (global as any).testResult;
      
      expect(result).toMatchSnapshot();
    });
  });
});