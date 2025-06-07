import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest } from "@proto-graphql/testapis-proto";
import { 
  ObjectType, 
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMappingForTsProto,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parsePothosOptions } from "@proto-graphql/protoc-plugin-helpers";
import { code } from "ts-poet";
import { describe, expect, test } from "vitest";
import { createObjectTypeCode } from "./objectType.js";
import type { PothosPrinterOptions } from "./util.js";

// Helper to extract ObjectType instances and generate code
function generateObjectTypeCode(packageName: string, messageTypeName: string, options: PothosPrinterOptions) {
  const req = buildCodeGeneratorRequest(packageName);
  
  // Default type options
  const typeOptions = {
    partialInputs: false,
    scalarMapping: options.protobuf === "ts-proto" ? defaultScalarMappingForTsProto : defaultScalarMapping,
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
      dsl: "pothos",
    }),
    parseOptions: parsePothosOptions,
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
      const objectType = types.find(t => t.typeName === messageTypeName && t instanceof ObjectType) as ObjectType;
      if (!objectType) throw new Error(`${messageTypeName} type not found`);
      
      const generatedCode = createObjectTypeCode(objectType, registry, options);
      
      // Store the result for testing
      (global as any).testResult = generatedCode.toString();
    },
    parseOptions: parsePothosOptions,
  });
  
  testPlugin.run(req);
  
  const result = (global as any).testResult;
  delete (global as any).testResult;
  return result;
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
      const code = generateObjectTypeCode("testapis.primitives", "Primitives", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with nested fields", () => {
      const code = generateObjectTypeCode("testapis.primitives", "Message", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with oneofs", () => {
      const code = generateObjectTypeCode("testapis.oneof", "OneofParent", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for empty message", () => {
      const code = generateObjectTypeCode("testapis.empty_types", "EmptyMessage", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested types", () => {
      const code = generateObjectTypeCode("testapis.nested", "ParentMessage", options);
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
      const code = generateObjectTypeCode("testapis.primitives", "Primitives", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with nested fields", () => {
      const code = generateObjectTypeCode("testapis.primitives", "Message", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a message with oneofs", () => {
      const code = generateObjectTypeCode("testapis.oneof", "OneofParent", options);
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
      const code = generateObjectTypeCode("testapis.extensions", "TestPrefixPrefixedMessage", options);
      expect(code).toMatchSnapshot();
    });
  });
});