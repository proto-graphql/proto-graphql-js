import { createFileRegistry } from "@bufbuild/protobuf";
import {
  OneofUnionType,
  SquashedOneofUnionType,
  type TypeOptions,
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
} from "@proto-graphql/codegen-core";
import {
  type TestapisPackage,
  getTestapisFileDescriptorSet,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { PothosPrinterOptions } from "./util.js";

function generateOneofUnionTypeCode(
  packageName: TestapisPackage,
  typeNameInProto: string,
  oneofFieldName: string,
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
        test: "generates code for a required oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "required_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for an optional oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "optional_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for a squashed oneof union",
        args: {
          packageName: "testapis.extensions",
          typeNameInProto: "PrefixedMessage.SquashedMessage",
        },
      } as SquashedTestCase,
      {
        test: "generates code for imported oneof member",
        args: {
          packageName: "testapis.edgecases.import_oneof_member_from_other_file",
          typeNameInProto: "OneofParent",
          oneofFieldName: "oneof_field",
        },
      } as OneofTestCase,
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
        test: "generates code for a required oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "required_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for an optional oneof union",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "optional_oneof_members",
        },
      } as OneofTestCase,
      {
        test: "generates code for a squashed oneof union",
        args: {
          packageName: "testapis.extensions",
          typeNameInProto: "PrefixedMessage.SquashedMessage",
        },
      } as SquashedTestCase,
    ],
  },
  {
    suite: "with file layout graphql_type",
    options: {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "graphql_type",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    },
    cases: [
      {
        test: "generates code with correct imports for graphql_type layout",
        args: {
          packageName: "testapis.oneof",
          typeNameInProto: "OneofParent",
          oneofFieldName: "required_oneof_members",
        },
      } as OneofTestCase,
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