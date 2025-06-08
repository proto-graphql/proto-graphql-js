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

describe("createOneofUnionTypeCode", () => {
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

    test("generates code for a required oneof union", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.oneof",
        "OneofParent",
        "required_oneof_members",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an optional oneof union", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.oneof",
        "OneofParent",
        "optional_oneof_members",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for a squashed oneof union", () => {
      const code = generateSquashedOneofUnionTypeCode(
        "testapis.extensions",
        "PrefixedMessage.SquashedMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for imported oneof member", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.edgecases.import_oneof_member_from_other_file",
        "OneofParent",
        "oneof_field",
        options,
      );
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

    test("generates code for a required oneof union", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.oneof",
        "OneofParent",
        "required_oneof_members",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for an optional oneof union", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.oneof",
        "OneofParent",
        "optional_oneof_members",
        options,
      );
      expect(code).toMatchSnapshot();
    });

    test("generates code for a squashed oneof union", () => {
      const code = generateSquashedOneofUnionTypeCode(
        "testapis.extensions",
        "PrefixedMessage.SquashedMessage",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });

  describe("with file layout graphql_type", () => {
    const options: PothosPrinterOptions = {
      dsl: "pothos",
      protobuf: "ts-proto" as const,
      importPrefix: "@testapis/ts-proto",
      emitImportedFiles: false,
      fileLayout: "graphql_type",
      filenameSuffix: ".pothos",
      pothos: {
        builderPath: "../../builder",
      },
    };

    test("generates code with correct imports for graphql_type layout", () => {
      const code = generateOneofUnionTypeCode(
        "testapis.oneof",
        "OneofParent",
        "required_oneof_members",
        options,
      );
      expect(code).toMatchSnapshot();
    });
  });
});
