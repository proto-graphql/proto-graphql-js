import { createEcmaScriptPlugin } from "@bufbuild/protoplugin";
import {
  ObjectType,
  type TypeOptions,
  createRegistryFromSchema,
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  buildCodeGeneratorRequest,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { printObjectType } from "./objectType.js";
import type { PothosPrinterOptions } from "./util.js";

type TestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    messageTypeName: string;
    scalarMapping?: Record<string, string>;
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
  {
    suite: "with custom scalar mapping",
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
        test: "uses custom scalar mapping for Int64",
        args: {
          packageName: "testapis.primitives",
          messageTypeName: "Primitives",
          scalarMapping: {
            ...defaultScalarMappingForTsProto,
            int64: "BigInt",
            uint64: "BigInt",
          },
        },
      },
    ],
  },
];

function generateObjectTypeWithPrintFunction(
  packageName: TestapisPackage,
  messageTypeName: string,
  options: PothosPrinterOptions,
  customScalarMapping?: Record<string, string>,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping:
      customScalarMapping ||
      (options.protobuf === "ts-proto"
        ? defaultScalarMappingForTsProto
        : defaultScalarMapping),
    ignoreNonMessageOneofFields: false,
  };

  // const descSet = getTestapisFileDescriptorSet(packageName);
  // const registry = createFileRegistry(descSet);
  // const descMsg = registry.getMessage(`${packageName}.${messageTypeName}`);
  // if (descMsg === undefined) {
  //   throw new Error(
  //     `Message ${messageTypeName} not found in package ${packageName}`,
  //   );
  // }

  const plugin = createEcmaScriptPlugin({
    name: "test",
    version: "0.0.0",
    generateTs: (schema) => {
      const registry = createRegistryFromSchema(schema);
      const descMsg = registry.getMessage(`${packageName}.${messageTypeName}`);
      if (descMsg === undefined) {
        throw new Error(
          `Message ${messageTypeName} not found in package ${packageName}`,
        );
      }
      const objType = new ObjectType(descMsg, typeOptions);

      const f = schema.generateFile("generated.ts");
      printObjectType(f, objType, registry, options);
    },
  });

  const req = buildCodeGeneratorRequest(packageName);
  req.parameter = "target=ts";

  const resp = plugin.run(req);

  const file = resp.file.find((f) => f.name === "generated.ts");
  if (!file) {
    throw new Error("Generated file not found");
  }

  return file.content;
}

describe("printObjectType", () => {
  for (const { suite, options, cases } of testSuites) {
    describe(suite, () => {
      test.each(cases)("$test", ({ args }) => {
        const code = generateObjectTypeWithPrintFunction(
          args.packageName,
          args.messageTypeName,
          options,
          args.scalarMapping,
        );
        expect(code).toMatchSnapshot();
      });
    });
  }
});
