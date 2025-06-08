import { getTestapisFileDescriptorSet, TestapisPackage } from "@proto-graphql/testapis-proto";
import { 
  EnumType,
  TypeOptions,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createFileRegistry } from "@bufbuild/protobuf";
import { describe, expect, test } from "vitest";
import { createEnumTypeCode } from "./enumType.js";

function generateEnumTypeCode(packageName: TestapisPackage, enumTypeNameInProto: string): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
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

  const code = createEnumTypeCode(enumType, registry);

  return code.toString();
}

describe("createEnumTypeCode", () => {
  describe("google-protobuf", () => {
    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum");
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified");
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessage.NestedEnum");
      expect(code).toMatchSnapshot();
    });

    test("generates code for enum with extensions", () => {
      const code = generateEnumTypeCode("testapis.extensions", "PrefixedEnum");
      expect(code).toMatchSnapshot();
    });
  });

  describe("protobufjs", () => {
    test("generates code for a simple enum", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnum");
      expect(code).toMatchSnapshot();
    });

    test("generates code for an enum without unspecified", () => {
      const code = generateEnumTypeCode("testapis.enums", "MyEnumWithoutUnspecified");
      expect(code).toMatchSnapshot();
    });

    test("generates code for nested enum", () => {
      const code = generateEnumTypeCode("testapis.nested", "ParentMessage.NestedEnum");
      expect(code).toMatchSnapshot();
    });
  });
});