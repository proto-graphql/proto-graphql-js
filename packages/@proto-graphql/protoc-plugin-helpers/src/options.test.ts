import { describe, expect, it } from "vitest";
import { parsePothosOptions } from "./options.js";

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
});
