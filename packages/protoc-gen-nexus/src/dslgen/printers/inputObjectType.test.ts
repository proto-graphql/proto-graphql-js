import { createFileRegistry } from "@bufbuild/protobuf";
import {
  InputObjectType,
  type TypeOptions,
  defaultScalarMapping,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createInputObjectTypeCode } from "./inputObjectType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateInputObjectTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  options: NexusPrinterOptions,
  partialInputs = false,
): string {
  const typeOptions: TypeOptions = {
    partialInputs,
    scalarMapping: defaultScalarMapping,
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

  const code = createInputObjectTypeCode(
    partialInputs ? inputType.toPartialInput() : inputType,
    registry,
    options,
  );

  return code.toString();
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
  options: NexusPrinterOptions;
  cases: TestCase[];
};

const testSuites: TestSuite[] = [
  {
    suite: "google-protobuf",
    options: {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    },
    cases: [
      {
        test: "generates code for a simple input object",
        args: {
          packageName: "testapis.primitives",
          typeNameInProto: "Primitives",
        },
      },
      {
        test: "generates code for an input object with nested fields",
        args: {
          packageName: "testapis.primitives",
          typeNameInProto: "Message",
        },
      },
      {
        test: "generates code for an input object with oneof fields",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
        },
      },
      {
        test: "generates code for empty input object",
        args: {
          packageName: "testapis.empty_types",
          typeNameInProto: "EmptyMessage",
        },
      },
      {
        test: "generates code for nested input types",
        args: {
          packageName: "testapis.nested",
          typeNameInProto: "ParentMessage",
        },
      },
    ],
  },
  {
    suite: "protobufjs",
    options: {
      dsl: "nexus",
      protobuf: "protobufjs" as const,
      importPrefix: "@testapis/protobufjs",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    },
    cases: [
      {
        test: "generates code for a simple input object",
        args: {
          packageName: "testapis.primitives",
          typeNameInProto: "Primitives",
        },
      },
      {
        test: "generates code for an input object with nested fields",
        args: {
          packageName: "testapis.primitives",
          typeNameInProto: "Message",
        },
      },
      {
        test: "generates code for an input object with oneof fields",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
        },
      },
      {
        test: "generates code for empty input object",
        args: {
          packageName: "testapis.empty_types",
          typeNameInProto: "EmptyMessage",
        },
      },
    ],
  },
  {
    suite: "with partial inputs",
    options: {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    },
    cases: [
      {
        test: "generates code for partial input types",
        args: {
          packageName: "testapis.primitives",
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
