import { describe, expect, it } from "vitest";
import { parseParams } from "./parseParams.js";

describe("parseParams", () => {
  it("reutrns true if value is empty", () => {
    expect(
      parseParams("use_protobufjs=true", "nexus").printer.protobuf,
    ).toEqual("protobufjs");
  });

  it('parses "true" string to true', () => {
    expect(
      parseParams("use_protobufjs=true", "nexus").printer.protobuf,
    ).toEqual("protobufjs");
  });

  it('parses "true" string to false', () => {
    expect(
      parseParams("use_protobufjs=false", "nexus").printer.protobuf,
    ).toEqual("google-protobuf");
  });

  it("parses importPrefix", () => {
    expect(
      parseParams("import_prefix=@foobar/baz", "nexus").printer.importPrefix,
    ).toEqual("@foobar/baz");
  });

  it("parses fileLayout", () => {
    expect(
      parseParams("file_layout=graphql_type", "nexus").printer.fileLayout,
    ).toEqual("graphql_type");
  });

  it("throws an erorr when useProtobufjs is string", () => {
    expect(() => {
      parseParams("use_protobufjs=foobar", "nexus");
    }).toThrow();
  });

  it("throws an erorr when importString is boolean", () => {
    expect(() => {
      parseParams("import_prefix", "nexus");
    }).toThrow();
  });

  it("throws an erorr when invalid fileLayout", () => {
    expect(() => {
      parseParams("file_layout=foobar", "nexus");
    }).toThrow();
  });

  it("throws an erorr when received unknown params", () => {
    expect(() => {
      parseParams("foobar=qux", "nexus");
    }).toThrow();
  });
});
