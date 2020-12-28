import { parseParams } from "../process";
import { itGeenratesNexusDSLsToMatchSnapshtos } from "./__helpers__/process.test.helper";

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
    expect(parseParams("import_prefix=@foobar/baz").importPrefix).toBe(
      "@foobar/baz"
    );
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

  it("throws an erorr when received unknown params", () => {
    expect(() => {
      parseParams("foobar=qux");
    }).toThrow();
  });
});

describe("simple proto file", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("hello", ["hello/hello_pb_nexus.ts"]);
});

describe("well-known protobuf types", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("wktypes", [
    "wktypes/well_known_types_pb_nexus.ts",
  ]);
});

describe("protobuf enums", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("enums", ["enums/enums_pb_nexus.ts"]);
});

describe("nested protobuf types", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("nested", ["nested/nested_pb_nexus.ts"]);
});

describe("protobuf custom options", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("extensions", [
    "extensions/extensions_pb_nexus.ts",
  ]);
});

describe("protobuf oneof", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("oneof", ["oneof/oneof_pb_nexus.ts"]);
});

describe("deprecation", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("deprecation", [
    "deprecation/deprecation_pb_nexus.ts",
    "deprecation/file_deprecation_pb_nexus.ts",
  ]);
});

describe("field_behavior", () => {
  itGeenratesNexusDSLsToMatchSnapshtos("field_behavior", [
    "field_behavior/comments_pb_nexus.ts",
  ]);
});
