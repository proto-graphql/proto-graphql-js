import { createFileRegistry } from "@bufbuild/protobuf";
import type { PrinterOptions } from "@proto-graphql/codegen-core";
import {
  getTestapisFileDescriptorSet,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { describe, expect, test } from "vitest";
import { printablesToStringWithImports } from "./__tests__/test-utils.js";
import {
  protobufCreateSymbol,
  protobufIsMessageSymbol,
  protobufMessageShapeSymbol,
  protoRefTypePrintable,
  protoSchemaSymbol,
  protoTypeSymbol,
} from "./util.js";

function getDescMessage(packageName: TestapisPackage, typeName: string) {
  const descSet = getTestapisFileDescriptorSet(packageName);
  const registry = createFileRegistry(descSet);
  const descMsg = registry.getMessage(`${packageName}.${typeName}`);
  if (descMsg === undefined) {
    throw new Error(`Message ${typeName} not found in package ${packageName}`);
  }
  return descMsg;
}

describe("protoTypeSymbol", () => {
  describe("protobuf-es (v2)", () => {
    const opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
      protobuf: "protobuf-es",
      importPrefix: "@testapis/protobuf-es-v2",
    };

    test("generates correct import path with _pb suffix for message", () => {
      const descMsg = getDescMessage("testapis.primitives", "Primitives");
      const symbol = protoTypeSymbol(descMsg, opts);

      expect(symbol.name).toBe("Primitives");
      expect(symbol.from).toBe(
        "@testapis/protobuf-es-v2/testapis/primitives/primitives_pb",
      );
    });

    test("generates correct import path with _pb suffix for nested message", () => {
      const registry = createFileRegistry(
        getTestapisFileDescriptorSet("testapis.nested"),
      );
      const nestedMsg = registry.getMessage(
        "testapis.nested.ParentMessage.NestedMessage",
      );
      if (nestedMsg === undefined) {
        throw new Error("Nested message not found");
      }
      const symbol = protoTypeSymbol(nestedMsg, opts);

      expect(symbol.name).toBe("ParentMessage_NestedMessage");
      expect(symbol.from).toBe(
        "@testapis/protobuf-es-v2/testapis/nested/nested_pb",
      );
    });

    test("generates correct import path without prefix", () => {
      const optsNoPrefix: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
        protobuf: "protobuf-es",
        importPrefix: null,
      };
      const descMsg = getDescMessage("testapis.primitives", "Primitives");
      const symbol = protoTypeSymbol(descMsg, optsNoPrefix);

      expect(symbol.name).toBe("Primitives");
      expect(symbol.from).toBe("./testapis/primitives/primitives_pb");
    });

    test("generates same import path as protobuf-es-v1", () => {
      const descMsg = getDescMessage("testapis.primitives", "Primitives");

      const v1Opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
        protobuf: "protobuf-es-v1",
        importPrefix: "@testapis/protobuf-es",
      };
      const v2Opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
        protobuf: "protobuf-es",
        importPrefix: "@testapis/protobuf-es",
      };

      const v1Symbol = protoTypeSymbol(descMsg, v1Opts);
      const v2Symbol = protoTypeSymbol(descMsg, v2Opts);

      expect(v1Symbol.from).toBe(v2Symbol.from);
    });
  });
});

describe("protoSchemaSymbol", () => {
  const opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
    protobuf: "protobuf-es",
    importPrefix: "@testapis/protobuf-es-v2",
  };

  test("generates Schema symbol with Schema suffix for message", () => {
    const descMsg = getDescMessage("testapis.primitives", "Primitives");
    const symbol = protoSchemaSymbol(descMsg, opts);

    expect(symbol.name).toBe("PrimitivesSchema");
    expect(symbol.from).toBe(
      "@testapis/protobuf-es-v2/testapis/primitives/primitives_pb",
    );
  });

  test("generates Schema symbol for nested message with underscore separator", () => {
    const registry = createFileRegistry(
      getTestapisFileDescriptorSet("testapis.nested"),
    );
    const nestedMsg = registry.getMessage(
      "testapis.nested.ParentMessage.NestedMessage",
    );
    if (nestedMsg === undefined) {
      throw new Error("Nested message not found");
    }
    const symbol = protoSchemaSymbol(nestedMsg, opts);

    expect(symbol.name).toBe("ParentMessage_NestedMessageSchema");
    expect(symbol.from).toBe(
      "@testapis/protobuf-es-v2/testapis/nested/nested_pb",
    );
  });

  test("generates Schema symbol without prefix", () => {
    const optsNoPrefix: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
      protobuf: "protobuf-es",
      importPrefix: null,
    };
    const descMsg = getDescMessage("testapis.primitives", "Primitives");
    const symbol = protoSchemaSymbol(descMsg, optsNoPrefix);

    expect(symbol.name).toBe("PrimitivesSchema");
    expect(symbol.from).toBe("./testapis/primitives/primitives_pb");
  });
});

describe("protobufCreateSymbol", () => {
  test("generates create symbol from @bufbuild/protobuf", () => {
    const symbol = protobufCreateSymbol();

    expect(symbol.name).toBe("create");
    expect(symbol.from).toBe("@bufbuild/protobuf");
  });
});

describe("protobufIsMessageSymbol", () => {
  test("generates isMessage symbol from @bufbuild/protobuf", () => {
    const symbol = protobufIsMessageSymbol();

    expect(symbol.name).toBe("isMessage");
    expect(symbol.from).toBe("@bufbuild/protobuf");
  });
});

describe("protobufMessageShapeSymbol", () => {
  test("generates MessageShape symbol from @bufbuild/protobuf", () => {
    const symbol = protobufMessageShapeSymbol();

    expect(symbol.name).toBe("MessageShape");
    expect(symbol.from).toBe("@bufbuild/protobuf");
  });
});

describe("protoRefTypePrintable", () => {
  const v2Opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
    protobuf: "protobuf-es",
    importPrefix: "@testapis/protobuf-es-v2",
  };
  const v1Opts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
    protobuf: "protobuf-es-v1",
    importPrefix: "@testapis/protobuf-es",
  };
  const tsProtoOpts: Pick<PrinterOptions, "protobuf" | "importPrefix"> = {
    protobuf: "ts-proto",
    importPrefix: "@testapis/ts-proto",
  };

  test("generates MessageShape<typeof XxxSchema> for protobuf-es v2", () => {
    const descMsg = getDescMessage("testapis.primitives", "Primitives");
    const printable = protoRefTypePrintable(descMsg, v2Opts);

    const result = printablesToStringWithImports(printable);

    expect(result).toContain("MessageShape<typeof PrimitivesSchema>");
    expect(result).toContain(
      'import { MessageShape } from "@bufbuild/protobuf"',
    );
    expect(result).toContain("PrimitivesSchema");
  });

  test("generates type symbol for protobuf-es v1", () => {
    const descMsg = getDescMessage("testapis.primitives", "Primitives");
    const printable = protoRefTypePrintable(descMsg, v1Opts);

    const result = printablesToStringWithImports(printable);

    expect(result).toContain("Primitives");
    expect(result).not.toContain("MessageShape");
    expect(result).not.toContain("Schema");
  });

  test("generates type symbol for ts-proto", () => {
    const descMsg = getDescMessage("testapis.primitives", "Primitives");
    const printable = protoRefTypePrintable(descMsg, tsProtoOpts);

    const result = printablesToStringWithImports(printable);

    expect(result).toContain("Primitives");
    expect(result).not.toContain("MessageShape");
    expect(result).not.toContain("Schema");
  });

  test("generates MessageShape with nested message Schema for protobuf-es v2", () => {
    const registry = createFileRegistry(
      getTestapisFileDescriptorSet("testapis.nested"),
    );
    const nestedMsg = registry.getMessage(
      "testapis.nested.ParentMessage.NestedMessage",
    );
    if (nestedMsg === undefined) {
      throw new Error("Nested message not found");
    }

    const printable = protoRefTypePrintable(nestedMsg, v2Opts);
    const result = printablesToStringWithImports(printable);

    expect(result).toContain(
      "MessageShape<typeof ParentMessage_NestedMessageSchema>",
    );
  });
});
