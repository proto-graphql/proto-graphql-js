import { parseParams } from "./parseParams";

describe("parseParams", () => {
  it("reutrns true if value is empty", () => {
    expect(parseParams("use_protobufjs=true").useProtobufjs).toBe(true);
  });

  it('parses "true" string to true', () => {
    expect(parseParams("use_protobufjs=true").useProtobufjs).toBe(true);
  });

  it('parses "true" string to false', () => {
    expect(parseParams("use_protobufjs=false").useProtobufjs).toBe(false);
  });

  it("parses importPrefix", () => {
    expect(parseParams("import_prefix=@foobar/baz").importPrefix).toBe("@foobar/baz");
  });

  it("parses fileLayout", () => {
    expect(parseParams("file_layout=graphql_type").fileLayout).toBe("graphql_type");
  });

  it("throws an erorr when useProtobufjs is string", () => {
    expect(() => {
      parseParams("use_protobufjs=foobar");
    }).toThrow();
  });

  it("throws an erorr when importString is boolean", () => {
    expect(() => {
      parseParams("import_prefix");
    }).toThrow();
  });

  it("throws an erorr when invalid fileLayout", () => {
    expect(() => {
      parseParams("file_layout=foobar");
    }).toThrow();
  });

  it("throws an erorr when received unknown params", () => {
    expect(() => {
      parseParams("foobar=qux");
    }).toThrow();
  });
});
