import { createFileRegistry } from "@bufbuild/protobuf";
import {
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
  EnumType,
  type TypeOptions,
} from "@proto-graphql/codegen-core";
import {
  getTestapisFileDescriptorSet,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createEnumTypeCode } from "./enumType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateEnumTypeCode(
  packageName: TestapisPackage,
  enumTypeNameInProto: string,
  options: PothosPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping:
      options.protobuf === "ts-proto"
        ? defaultScalarMappingForTsProto
        : defaultScalarMapping,
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
    throw new Error(
      `Enum ${enumTypeNameInProto} not found in package ${packageName}`,
    );
  }

  const enumType = new EnumType(descEnum, typeOptions);

  const code = createEnumTypeCode(enumType, registry, options);

  return code.toString();
}

type TestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    enumTypeNameInProto: string;
  };
};

type TestSuite = {
  suite: string;
  options: PothosPrinterOptions;
  cases: TestCase[];
};

const testSuites: TestSuite[] = [
  {
    suite: "ts-proto",
    options: {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    },
    cases: [
      {
        test: "generates code for a simple enum",
        args: {
          packageName: "testapis.enums",
          enumTypeNameInProto: "MyEnum",
        },
      },
      {
        test: "generates code for an enum without unspecified",
        args: {
          packageName: "testapis.enums",
          enumTypeNameInProto: "MyEnumWithoutUnspecified",
        },
      },
      {
        test: "generates code for nested enum",
        args: {
          packageName: "testapis.nested",
          enumTypeNameInProto: "ParentMessage.NestedEnum",
        },
      },
      {
        test: "generates code for enum with extensions",
        args: {
          packageName: "testapis.extensions",
          enumTypeNameInProto: "PrefixedEnum",
        },
      },
    ],
  },
  {
    suite: "protobuf-es",
    options: {
      dsl: "pothos",
      protobuf: "protobuf-es" as const,
      importPrefix: "@testapis/protobuf-es",
      emitImportedFiles: false,
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    },
    cases: [
      {
        test: "generates code for a simple enum",
        args: {
          packageName: "testapis.enums",
          enumTypeNameInProto: "MyEnum",
        },
      },
      {
        test: "generates code for an enum without unspecified",
        args: {
          packageName: "testapis.enums",
          enumTypeNameInProto: "MyEnumWithoutUnspecified",
        },
      },
      {
        test: "generates code for nested enum",
        args: {
          packageName: "testapis.nested",
          enumTypeNameInProto: "ParentMessage.NestedEnum",
        },
      },
    ],
  },
];

describe("createEnumTypeCode", () => {
  for (const { suite, options, cases } of testSuites) {
    describe(suite, () => {
      test.each(cases)("$test", ({ args }) => {
        const code = generateEnumTypeCode(
          args.packageName,
          args.enumTypeNameInProto,
          options,
        );
        expect(code).toMatchSnapshot();
      });
    });
  }
});
