import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest } from "@proto-graphql/testapis-proto";
import { 
  OneofUnionType,
  SquashedOneofUnionType,
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parseNexusOptions } from "@proto-graphql/protoc-plugin-helpers";
import { code } from "ts-poet";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { NexusPrinterOptions } from "./util.js";

// Helper to extract OneofUnionType instances and generate code
function generateOneofUnionTypeCode(packageName: string, typeName: string, options: NexusPrinterOptions) {
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
      let targetFile = schema.allFiles.find(f => f.name.includes(packageName.split('.')[1]));
      
      // Special handling for edge cases
      if (packageName === "testapis.edgecases.import_squashed_union.pkg1") {
        targetFile = schema.allFiles.find(f => f.name.includes("import_squashed_union/pkg1/types"));
      }
      
      if (!targetFile) throw new Error(`File for ${packageName} not found`);
      
      const types = collectTypesFromFile(targetFile, typeOptions, schema.allFiles);
      const oneofType = types.find(t => t.typeName === typeName && (t instanceof OneofUnionType || t instanceof SquashedOneofUnionType)) as OneofUnionType | SquashedOneofUnionType;
      if (!oneofType) throw new Error(`${typeName} type not found`);
      
      const generatedCode = createOneofUnionTypeCode(oneofType, registry, options);
      
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

describe("createOneofUnionTypeCode", () => {
  describe("google-protobuf", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentRequiredOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentOptionalOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for import squashed union", () => {
      const code = generateOneofUnionTypeCode("testapis.edgecases.import_squashed_union.pkg1", "SquashedOneof", options);
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

    test("generates code for a simple oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentRequiredOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentOptionalOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for import squashed union", () => {
      const code = generateOneofUnionTypeCode("testapis.edgecases.import_squashed_union.pkg1", "SquashedOneof", options);
      expect(code).toMatchSnapshot();
    });
  });
});