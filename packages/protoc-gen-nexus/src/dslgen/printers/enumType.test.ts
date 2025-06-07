import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest } from "@proto-graphql/testapis-proto";
import { 
  EnumType, 
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMappingForTsProto,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parseNexusOptions } from "@proto-graphql/protoc-plugin-helpers";
import { code } from "ts-poet";
import { describe, expect, test } from "vitest";
import { createEnumTypeCode } from "./enumType.js";

// Helper to extract EnumType instances and generate code
function generateEnumTypeCode(packageName: string, enumTypeName: string, protobuf: "google-protobuf" | "protobufjs") {
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
      const enumType = types.find(t => t.typeName === enumTypeName && t instanceof EnumType) as EnumType;
      if (!enumType) throw new Error(`${enumTypeName} type not found`);
      
      const generatedCode = createEnumTypeCode(enumType, registry);
      
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

describe("createEnumTypeCode", () => {
  describe("google-protobuf", () => {
    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum", "google-protobuf");
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified", "google-protobuf");
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessageNestedEnum", "google-protobuf");
      expect(code).toMatchSnapshot();
    });

    test("generates code for enum with extensions", () => {
      const code = generateEnumTypeCode("testapis.extensions", "TestPrefixPrefixedEnum", "google-protobuf");
      expect(code).toMatchSnapshot();
    });
  });

  describe("protobufjs", () => {
    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum", "protobufjs");
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified", "protobufjs");
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessageNestedEnum", "protobufjs");
      expect(code).toMatchSnapshot();
    });
  });
});