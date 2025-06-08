import { createFileRegistry } from "@bufbuild/protobuf";
import {
  ObjectType,
  type TypeOptions,
  defaultScalarMapping,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createObjectTypeCode } from "./objectType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateObjectTypeCode(
  packageName: TestapisPackage,
  messageTypeName: string,
  options: NexusPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  const descMsg = registry.getMessage(`${packageName}.${messageTypeName}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${messageTypeName} not found in package ${packageName}`,
    );
  }

  const objType = new ObjectType(descMsg, typeOptions);

  const code = createObjectTypeCode(objType, registry, options);

  return code.toString();
}

type TestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    messageTypeName: string;
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
        test: "generates code for a simple message",
        args: {
          packageName: "testapis.primitives",
          messageTypeName: "Primitives",
        },
      },
      {
        test: "generates code for a message with nested fields",
        args: {
          packageName: "testapis.primitives",
          messageTypeName: "Message",
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
        test: "generates code for a simple message",
        args: {
          packageName: "testapis.primitives",
          messageTypeName: "Primitives",
        },
      },
      {
        test: "generates code for a message with nested fields",
        args: {
          packageName: "testapis.primitives",
          messageTypeName: "Message",
        },
      },
      {
        test: "generates code for a message with oneofs",
        args: {
          packageName: "testapis.oneof",
          messageTypeName: "OneofParent",
        },
      },
    ],
  },
  {
    suite: "with extensions",
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
        test: "generates code for message with field extensions",
        args: {
          packageName: "testapis.extensions",
          messageTypeName: "PrefixedMessage",
        },
      },
    ],
  },
];

describe("createObjectTypeCode", () => {
  for (const { suite, options, cases } of testSuites) {
    describe(suite, () => {
      test.each(cases)("$test", ({ args }) => {
        const code = generateObjectTypeCode(
          args.packageName,
          args.messageTypeName,
          options,
        );
        expect(code).toMatchSnapshot();
      });
    });
  }
});