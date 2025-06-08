import { createFileRegistry } from "@bufbuild/protobuf";
import {
  ObjectType,
  type TypeOptions,
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createObjectTypeCode } from "./objectType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateObjectTypeCode(
  packageName: TestapisPackage,
  messageTypeName: string,
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
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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
      {
        test: "generates code for empty message",
        args: {
          packageName: "testapis.empty_types",
          messageTypeName: "EmptyMessage",
        },
      },
      {
        test: "generates code for nested types",
        args: {
          packageName: "testapis.nested",
          messageTypeName: "ParentMessage",
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
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
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