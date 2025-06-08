import { getTestapisFileDescriptorSet, TestapisPackage } from "@proto-graphql/testapis-proto";
import { 
  OneofUnionType,
  SquashedOneofUnionType,
  TypeOptions,
  defaultScalarMapping
} from "@proto-graphql/codegen-core";
import { createFileRegistry } from "@bufbuild/protobuf";
import { describe, expect, test } from "vitest";
import { createOneofUnionTypeCode } from "./oneofUnionType.js";
import type { NexusPrinterOptions } from "./util.js";

function generateOneofUnionTypeCode(packageName: TestapisPackage, typeNameInProto: string, oneofFieldName: string, options: NexusPrinterOptions): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet)
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(`Message ${typeNameInProto} not found in package ${packageName}`);
  }

  const descOneof = descMsg.oneofs.find(d => d.name === oneofFieldName)
  if (descOneof === undefined) {
    throw new Error(`Oneof field ${oneofFieldName} not found in message ${typeNameInProto} in package ${packageName}`);
  }

  const oneofType = new OneofUnionType(descOneof, typeOptions);

  const code = createOneofUnionTypeCode(oneofType, registry, options).toString();

  return code.toString();
}

function generateSquashedOneofUnionTypeCode(packageName: TestapisPackage, typeNameInProto: string, options: NexusPrinterOptions): string {
  const typeOptions: TypeOptions = {
    partialInputs: false,
    scalarMapping: defaultScalarMapping,
    ignoreNonMessageOneofFields: false,
  };

  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet)
  const descMsg = registry.getMessage(`${packageName}.${typeNameInProto}`);
  if (descMsg === undefined) {
    throw new Error(`Message ${typeNameInProto} not found in package ${packageName}`);
  }

  const oneofType = new SquashedOneofUnionType(descMsg, typeOptions);

  const code = createOneofUnionTypeCode(oneofType, registry, options).toString();

  return code.toString();
}

describe("createOneofUnionTypeCode", () => {
  describe("google-protobuf", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "google-protobuf" as const,
      importPrefix: "@testapis/google-protobuf",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParent", "required_oneof_members", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParent", "optional_oneof_members", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for import squashed union", () => {
      const code = generateSquashedOneofUnionTypeCode("testapis.edgecases.import_squashed_union.pkg1", "SquashedOneof", options);
      expect(code).toMatchSnapshot();
    });
  });

  describe("protobufjs", () => {
    const options: NexusPrinterOptions = {
      dsl: "nexus",
      protobuf: "protobufjs" as const,
      importPrefix: "@testapis/protobufjs",
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: ".nexus",
    };

    test("generates code for a simple oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParent", "required_oneof_members", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for optional oneof union", () => {
      const code = generateOneofUnionTypeCode("testapis.oneof", "OneofParent", "optional_oneof_members", options);
      expect(code).toMatchSnapshot();
    });

    test("generates code for import squashed union", () => {
      const code = generateSquashedOneofUnionTypeCode("testapis.edgecases.import_squashed_union.pkg1", "SquashedOneof", options);
      expect(code).toMatchSnapshot();
    });
  });
});