import { createFileRegistry } from "@bufbuild/protobuf";
import {
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
  InputObjectType,
  type TypeOptions,
} from "@proto-graphql/codegen-core";
import {
  getTestapisFileDescriptorSet,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { printablesToStringWithImports } from "./__tests__/test-utils.js";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateInputObjectTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  options: PothosPrinterOptions,
  partialInputs = false,
): string {
  const typeOptions: TypeOptions = {
    partialInputs,
    scalarMapping:
      options.protobuf === "ts-proto"
        ? defaultScalarMappingForTsProto
        : defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${typeNameInProto} not found in package ${packageName}`,
    );
  }

  const inputType = new InputObjectType(descMsg, typeOptions);

  const printable = createInputObjectTypeCode(
    partialInputs ? inputType.toPartialInput() : inputType,
    registry,
    options,
  );

  return printablesToStringWithImports(printable);
}

type TestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    typeNameInProto: string;
    partialInputs?: boolean;
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
        test: "generates code for a simple input object",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Primitives",
        },
      },
      {
        test: "generates code for an input object with nested fields",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Message",
        },
      },
      {
        test: "generates code for an input object with oneof fields",
        args: {
          packageName: "testapis.oneof.message_only",
          typeNameInProto: "OneofParent",
        },
      },
      {
        test: "generates code for empty input object",
        args: {
          packageName: "testapis.basic.empty",
          typeNameInProto: "EmptyMessage",
        },
      },
      {
        test: "generates code for nested input types",
        args: {
          packageName: "testapis.basic.nested",
          typeNameInProto: "ParentMessage",
        },
      },
    ],
  },
  {
    suite: "protobuf-es-v1",
    options: {
      dsl: "pothos",
      protobuf: "protobuf-es-v1" as const,
      importPrefix: "@testapis/protobuf-es",
      emitImportedFiles: false,
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    },
    cases: [
      {
        test: "generates code for a simple input object",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Primitives",
        },
      },
      {
        test: "generates code for an input object with nested fields",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Message",
        },
      },
      {
        test: "generates code for an input object with oneof fields",
        args: {
          packageName: "testapis.oneof.message_only",
          typeNameInProto: "OneofParent",
        },
      },
      {
        test: "generates code for empty input object",
        args: {
          packageName: "testapis.basic.empty",
          typeNameInProto: "EmptyMessage",
        },
      },
    ],
  },
  {
    suite: "protobuf-es",
    options: {
      dsl: "pothos",
      protobuf: "protobuf-es" as const,
      importPrefix: "@testapis/protobuf-es-v2",
      emitImportedFiles: false,
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    },
    cases: [
      {
        test: "generates code for a simple input object with create",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Primitives",
        },
      },
      {
        test: "generates code for an input object with nested fields with create",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Message",
        },
      },
      {
        test: "generates code for an input object with oneof fields with create",
        args: {
          packageName: "testapis.oneof.message_only",
          typeNameInProto: "OneofParent",
        },
      },
      {
        test: "generates code for empty input object with create",
        args: {
          packageName: "testapis.basic.empty",
          typeNameInProto: "EmptyMessage",
        },
      },
    ],
  },
  {
    suite: "with partial inputs",
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
        test: "generates code for partial input types",
        args: {
          packageName: "testapis.basic.scalars",
          typeNameInProto: "Message",
          partialInputs: true,
        },
      },
    ],
  },
];

describe("createInputObjectTypeCode", () => {
  for (const { suite, options, cases } of testSuites) {
    describe(suite, () => {
      test.each(cases)("$test", ({ args }) => {
        const code = generateInputObjectTypeCode(
          args.packageName,
          args.typeNameInProto,
          options,
          args.partialInputs ?? false,
        );
        expect(code).toMatchSnapshot();
      });
    });
  }
});
