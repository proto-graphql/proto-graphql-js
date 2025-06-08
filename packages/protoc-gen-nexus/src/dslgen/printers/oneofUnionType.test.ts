import { createFileRegistry } from "@bufbuild/protobuf";
import { 
  OneofUnionType,
  SquashedOneofUnionType,
  type TypeOptions,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateOneofUnionTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  oneofFieldName: string,
  options: NexusPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet)
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${typeNameInProto} not found in package ${packageName}`,
    );
  }

  const descOneof = descMsg.oneofs.find((d) => d.name === oneofFieldName);
  if (descOneof === undefined) {
    throw new Error(
      `Oneof field ${oneofFieldName} not found in message ${typeNameInProto} in package ${packageName}`,
    );
  }

  const oneofType = new OneofUnionType(descOneof, typeOptions);

  const code = createOneofUnionTypeCode(
    oneofType,
    registry,
    options,
  ).toString();

  return code.toString();
}

function generateSquashedOneofUnionTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  options: NexusPrinterOptions,
): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet)
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(
      `Message ${typeNameInProto} not found in package ${packageName}`,
    );
  }

  const oneofType = new SquashedOneofUnionType(descMsg, typeOptions);

  const code = createOneofUnionTypeCode(
    oneofType,
    registry,
    options,
  ).toString();

  return code.toString();
}

type OneofTestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    typeNameInProto: string;
    oneofFieldName: string;
  };
};

type SquashedTestCase = {
  test: string;
  args: {
    packageName: TestapisPackage;
    typeNameInProto: string;
  };
};

type TestCase = OneofTestCase | SquashedTestCase;

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
        test: "generates code for a simple oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "required_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for optional oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "optional_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for import squashed union",
        args: {
          packageName: "testapis.edgecases.import_squashed_union.pkg1",
          typeNameInProto: "SquashedOneof",
        },
      } as SquashedTestCase,
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
        test: "generates code for a simple oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "required_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for optional oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "optional_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for import squashed union",
        args: {
          packageName: "testapis.edgecases.import_squashed_union.pkg1",
          typeNameInProto: "SquashedOneof",
        },
      } as SquashedTestCase,
    ],
  },
];

describe("createOneofUnionTypeCode", () => {
  for (const { suite, options, cases } of testSuites) {
    describe(suite, () => {
      test.each(cases)("$test", ({ args }) => {
        if ("oneofFieldName" in args) {
          const code = generateOneofUnionTypeCode(
            args.packageName,
            args.typeNameInProto,
            args.oneofFieldName,
            options,
          );
          expect(code).toMatchSnapshot();
        } else {
          const code = generateSquashedOneofUnionTypeCode(
            args.packageName,
            args.typeNameInProto,
            options,
          );
          expect(code).toMatchSnapshot();
        }
      });
    });
  }
});