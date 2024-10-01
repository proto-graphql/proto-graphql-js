import { describe, expect, it } from "vitest";
import { parseOptions } from "./options.js";

describe("parseOptions", () => {
  it("reutrns true if value is empty", () => {
    expect(
      parseOptions([{ key: "use_protobufjs", value: "true" }], "nexus").printer
        .protobuf,
    ).toEqual("protobufjs");
  });

  it('parses "true" string to true', () => {
    expect(
      parseOptions([{ key: "use_protobufjs", value: "true" }], "nexus").printer
        .protobuf,
    ).toEqual("protobufjs");
  });

  it('parses "true" string to false', () => {
    expect(
      parseOptions([{ key: "use_protobufjs", value: "false" }], "nexus").printer
        .protobuf,
    ).toEqual("google-protobuf");
  });

  it("parses importPrefix", () => {
    expect(
      parseOptions([{ key: "import_prefix", value: "@foobar/baz" }], "nexus")
        .printer.importPrefix,
    ).toEqual("@foobar/baz");
  });

  it("parses fileLayout", () => {
    expect(
      parseOptions([{ key: "file_layout", value: "graphql_type" }], "nexus")
        .printer.fileLayout,
    ).toEqual("graphql_type");
  });

  it("throws an erorr when useProtobufjs is string", () => {
    expect(() => {
      parseOptions([{ key: "use_protobufjs", value: "foobar" }], "nexus");
    }).toThrow();
  });

  it("throws an erorr when importString is boolean", () => {
    expect(() => {
      parseOptions([{ key: "import_prefix", value: "" }], "nexus");
    }).toThrow();
  });

  it("throws an erorr when invalid fileLayout", () => {
    expect(() => {
      parseOptions([{ key: "file_layout", value: "foobar" }], "nexus");
    }).toThrow();
  });

  it("throws an erorr when received unknown params", () => {
    expect(() => {
      parseOptions([{ key: "foobar", value: "qux" }], "nexus");
    }).toThrow();
  });
});
