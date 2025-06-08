import { getTestapisFileDescriptorSet, TestapisPackage } from "@proto-graphql/testapis-proto";
import { 
  EnumType,
  TypeOptions,
  defaultScalarMappingForTsProto,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createFileRegistry } from "@bufbuild/protobuf";
import { describe, expect, test } from "vitest";
import { createEnumTypeCode } from "./enumType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateEnumTypeCode(packageName: TestapisPackage, enumTypeNameInProto: string, options: PothosPrinterOptions): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: options.protobuf === "ts-proto" ? defaultScalarMappingForTsProto : defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  
  // The actual proto package might differ from the TestapisPackage key
  // For example: "testapis.enums" key but "testapi.enums" proto package
  let descEnum = registry.getEnum(`${packageName}.${enumTypeNameInProto}`);
  
  if (descEnum === undefined && packageName === "testapis.enums") {
    // Try with the actual proto package name
    descEnum = registry.getEnum(`testapi.enums.${enumTypeNameInProto}`);
  }
  
  if (descEnum === undefined) {
    throw new Error(`Enum ${enumTypeNameInProto} not found in package ${packageName}`);
  }

  const enumType = new EnumType(descEnum, typeOptions);

  const code = createEnumTypeCode(enumType, registry, options);

  return code.toString();
}

describe("createEnumTypeCode", () => {
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

    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessage.NestedEnum", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for enum with extensions", () => {
      const code = generateEnumTypeCode("testapis.extensions", "PrefixedEnum", options);
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

    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessage.NestedEnum", options);
      expect(code).toMatchSnapshot();
    });
  });
});