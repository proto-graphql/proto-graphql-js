import { describe, expect, it } from "vitest";
import { parseDataloaderOptions, parsePothosOptions } from "./options.js";

describe("parsePothosOptions", () => {
  it("parses protobuf_lib option", () => {
    expect(
      parsePothosOptions([{ key: "protobuf_lib", value: "protobuf-es-v1" }])
        .printer.protobuf,
    ).toEqual("protobuf-es-v1");
  });

  it("uses ts-proto as default protobuf", () => {
    expect(parsePothosOptions([]).printer.protobuf).toEqual("ts-proto");
  });

  it("parses importPrefix", () => {
    expect(
      parsePothosOptions([{ key: "import_prefix", value: "@foobar/baz" }])
        .printer.importPrefix,
    ).toEqual("@foobar/baz");
  });

  it("throws an error when importPrefix is empty", () => {
    expect(() => {
      parsePothosOptions([{ key: "import_prefix", value: "" }]);
    }).toThrow();
  });

  it("throws an error when file_layout is specified", () => {
    expect(() => {
      parsePothosOptions([{ key: "file_layout", value: "proto_file" }]);
    }).toThrow("unknown param: file_layout=proto_file");
  });

  it("throws an error when received unknown params", () => {
    expect(() => {
      parsePothosOptions([{ key: "foobar", value: "qux" }]);
    }).toThrow();
  });

  it("parses pothos_builder_path option", () => {
    expect(
      parsePothosOptions([
        { key: "pothos_builder_path", value: "./my-builder" },
      ]).printer.pothos.builderPath,
    ).toEqual("./my-builder");
  });

  it("uses default builder path", () => {
    expect(parsePothosOptions([]).printer.pothos.builderPath).toEqual(
      "./builder",
    );
  });

  it("defaults format to true", () => {
    expect(parsePothosOptions([]).format).toBe(true);
  });

  it("parses format=false", () => {
    expect(parsePothosOptions([{ key: "format", value: "false" }]).format).toBe(
      false,
    );
  });

  it("parses format=true explicitly", () => {
    expect(parsePothosOptions([{ key: "format", value: "true" }]).format).toBe(
      true,
    );
  });

  it("throws on non-bool format value", () => {
    expect(() =>
      parsePothosOptions([{ key: "format", value: "maybe" }]),
    ).toThrow(/format should be bool/);
  });
});

describe("parseDataloaderOptions", () => {
  it("defaults importPrefix to null", () => {
    expect(parseDataloaderOptions([]).importPrefix).toBeNull();
  });

  it("parses import_prefix", () => {
    expect(
      parseDataloaderOptions([{ key: "import_prefix", value: "@foobar/baz" }])
        .importPrefix,
    ).toEqual("@foobar/baz");
  });

  it("throws an error when import_prefix is empty", () => {
    expect(() => {
      parseDataloaderOptions([{ key: "import_prefix", value: "" }]);
    }).toThrow();
  });

  it("defaults filenameSuffix to .pb.dataloader.ts", () => {
    expect(parseDataloaderOptions([]).filenameSuffix).toEqual(
      ".pb.dataloader.ts",
    );
  });

  it("parses filename_suffix", () => {
    expect(
      parseDataloaderOptions([
        { key: "filename_suffix", value: ".pb.loader.ts" },
      ]).filenameSuffix,
    ).toEqual(".pb.loader.ts");
  });

  it("defaults runtimeModule to @proto-graphql/connect-runtime", () => {
    expect(parseDataloaderOptions([]).runtimeModule).toEqual(
      "@proto-graphql/connect-runtime",
    );
  });

  it("parses runtime_module", () => {
    expect(
      parseDataloaderOptions([
        { key: "runtime_module", value: "@acme/runtime" },
      ]).runtimeModule,
    ).toEqual("@acme/runtime");
  });

  it("defaults emitImportedFiles to false", () => {
    expect(parseDataloaderOptions([]).emitImportedFiles).toBe(false);
  });

  it("parses emit_imported_files", () => {
    expect(
      parseDataloaderOptions([{ key: "emit_imported_files", value: "true" }])
        .emitImportedFiles,
    ).toBe(true);
  });

  it("defaults format to true", () => {
    expect(parseDataloaderOptions([]).format).toBe(true);
  });

  it("parses format=false", () => {
    expect(
      parseDataloaderOptions([{ key: "format", value: "false" }]).format,
    ).toBe(false);
  });

  it("throws on non-bool format value", () => {
    expect(() =>
      parseDataloaderOptions([{ key: "format", value: "maybe" }]),
    ).toThrow(/format should be bool/);
  });

  it("ignores the target param (used by @bufbuild/protoplugin)", () => {
    expect(() =>
      parseDataloaderOptions([{ key: "target", value: "ts" }]),
    ).not.toThrow();
  });

  it("throws when received unknown params", () => {
    expect(() => {
      parseDataloaderOptions([{ key: "foobar", value: "qux" }]);
    }).toThrow("unknown param: foobar=qux");
  });
});
