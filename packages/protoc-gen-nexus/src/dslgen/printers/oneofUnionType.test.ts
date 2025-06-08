import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest, TestapisPackage } from "@proto-graphql/testapis-proto";
import { 
  OneofUnionType,
  SquashedOneofUnionType,
  TypeOptions,
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parseNexusOptions } from "@proto-graphql/protoc-plugin-helpers";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateOneofUnionTypeCode(packageName: TestapisPackage, typeName: string, options: NexusPrinterOptions): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };
  
  const req = buildCodeGeneratorRequest(packageName);
  
  let result = "";
  const plugin = createEcmaScriptPlugin({
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
      
      result = createOneofUnionTypeCode(oneofType, registry, options).toString();
    },
    parseOptions: parseNexusOptions,
  });
  
  plugin.run(req);
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