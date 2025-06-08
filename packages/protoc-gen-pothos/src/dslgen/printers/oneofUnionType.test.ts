import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import { buildCodeGeneratorRequest, TestapisPackage } from "@proto-graphql/testapis-proto";
import { 
  OneofUnionType,
  SquashedOneofUnionType,
  TypeOptions,
  collectTypesFromFile,
  createRegistryFromSchema,
  defaultScalarMappingForTsProto,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createTsGenerator, parsePothosOptions } from "@proto-graphql/protoc-plugin-helpers";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateOneofUnionTypeCode(packageName: TestapisPackage, typeName: string, options: PothosPrinterOptions): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: options.protobuf === "ts-proto" ? defaultScalarMappingForTsProto : defaultScalarMapping,
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
      let targetFile;
      
      // For the import_oneof_member_from_other_file test, we need to check the parent.proto file
      if (packageName === "testapis.edgecases.import_oneof_member_from_other_file") {
        targetFile = schema.allFiles.find(f => f.name.includes("import_oneof_member_from_other_file/parent"));
      } else {
        targetFile = schema.allFiles.find(f => f.name.includes(packageName.split('.')[1]));
      }
      
      if (!targetFile) throw new Error(`File for ${packageName} not found`);
      
      const types = collectTypesFromFile(targetFile, typeOptions, schema.allFiles);
      const oneofType = types.find(t => t.typeName === typeName && (t instanceof OneofUnionType || t instanceof SquashedOneofUnionType));
      if (!oneofType) throw new Error(`${typeName} type not found`);
      
      result = createOneofUnionTypeCode(oneofType as OneofUnionType | SquashedOneofUnionType, registry, options).toString();
    },
    parseOptions: parsePothosOptions,
  });
  
  plugin.run(req);
  return result;
}

describe("createOneofUnionTypeCode", () => {
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

    test("generates code for a required oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentRequiredOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentOptionalOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a squashed oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.extensions", "TestPrefixPrefixedMessageSquashedMessage", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for imported oneof member", () => {
      const code = generateOneofUnionTypeCode("testapis.edgecases.import_oneof_member_from_other_file", "OneofParentOneofField", options);
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

    test("generates code for a required oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentRequiredOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentOptionalOneofMembers", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for a squashed oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.extensions", "TestPrefixPrefixedMessageSquashedMessage", options);
      expect(code).toMatchSnapshot();
    });
  });

  describe("with file layout graphql_type", () => {
    const options: PothosPrinterOptions = {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "graphql_type",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    };

    test("generates code with correct imports for graphql_type layout", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParentRequiredOneofMembers", options);
      expect(code).toMatchSnapshot();
    });
  });
});