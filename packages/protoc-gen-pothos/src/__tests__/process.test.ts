import {
  itGeneratesDSLsToMatchSnapshtos,
  generateDSLs,
  snapshotGeneratedFiles,
} from "./__helpers__/process.test.helper";

describe("simple proto file", () => {
  itGeneratesDSLsToMatchSnapshtos("primitives", ["primitives/primitives_pb_nexus.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("primitives", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "primitives/Message.nexus.ts",
      "primitives/Primitives.nexus.ts",
      "primitives/MessageInput.nexus.ts",
      "primitives/PrimitivesInput.nexus.ts",
    ]);
  });

  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs("primitives", "ts-proto", { partialInputs: true });
    snapshotGeneratedFiles(resp, ["primitives/primitives_pb_nexus.ts"]);
  });
});

describe("well-known protobuf types", () => {
  itGeneratesDSLsToMatchSnapshtos("wktypes", ["wktypes/well_known_types_pb_nexus.ts"]);
});

describe("protobuf enums", () => {
  itGeneratesDSLsToMatchSnapshtos("enums", ["enums/enums_pb_nexus.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("enums", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "enums/MessageWithEnums.nexus.ts",
      "enums/MyEnum.nexus.ts",
      "enums/MyEnumWithoutUnspecified.nexus.ts",
      "enums/MessageWithEnumsInput.nexus.ts",
    ]);
  });
});

describe("nested protobuf types", () => {
  itGeneratesDSLsToMatchSnapshtos("nested", ["nested/nested_pb_nexus.ts"]);
});

describe("protobuf custom options", () => {
  itGeneratesDSLsToMatchSnapshtos("extensions", [
    "extensions/extensions_pb_nexus.ts",
    "extensions/ignored_pb_nexus.ts",
  ]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("extensions", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "extensions/TestPrefixPrefixedMessage.nexus.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage.nexus.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage2.nexus.ts",
      "extensions/TestPrefixPrefixedMessageSquashedMessage.nexus.ts",
      "extensions/TestPrefixPrefixedMessagePartialIgnoreOneof.nexus.ts",
      "extensions/TestPrefixPrefixedEnum.nexus.ts",
      "extensions/TestPrefixIgnoredMessageNotIgnored.nexus.ts",
      "extensions/TestPrefixInterfaceMessage.nexus.ts",
      "extensions/TestPrefixInterfaceMessageType.nexus.ts",
      "extensions/TestPrefixRenamedMessage.nexus.ts",
      "extensions/TestPrefixPrefixedMessageInput.nexus.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessageInput.nexus.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage2Input.nexus.ts",
      "extensions/TestPrefixPrefixedMessageSquashedMessageInput.nexus.ts",
      "extensions/TestPrefixIgnoredMessageNotIgnoredInput.nexus.ts",
      "extensions/TestPrefixInterfaceMessageInput.nexus.ts",
      "extensions/TestPrefixRenamedMessageInput.nexus.ts",
    ]);
  });
});

describe("protobuf oneof", () => {
  itGeneratesDSLsToMatchSnapshtos("oneof", ["oneof/oneof_pb_nexus.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("oneof", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "oneof/OneofParent.nexus.ts",
      "oneof/OneofParentRequiredOneofMembers.nexus.ts",
      "oneof/OneofParentOptionalOneofMembers.nexus.ts",
      "oneof/OneofMemberMessage1.nexus.ts",
      "oneof/OneofMemberMessage2.nexus.ts",
      "oneof/OneofParentInput.nexus.ts",
      "oneof/OneofMemberMessage1Input.nexus.ts",
      "oneof/OneofMemberMessage2Input.nexus.ts",
    ]);
  });
});

describe("multipkgs", () => {
  itGeneratesDSLsToMatchSnapshtos("multipkgs/subpkg1", ["multipkgs/subpkg1/types_pb_nexus.ts"]);
  itGeneratesDSLsToMatchSnapshtos("multipkgs/subpkg2", ["multipkgs/subpkg2/types_pb_nexus.ts"]);
});

describe("deprecation", () => {
  itGeneratesDSLsToMatchSnapshtos("deprecation", [
    "deprecation/deprecation_pb_nexus.ts",
    "deprecation/file_deprecation_pb_nexus.ts",
  ]);
});

describe("field_behavior", () => {
  itGeneratesDSLsToMatchSnapshtos("field_behavior", ["field_behavior/comments_pb_nexus.ts"]);
});

describe("empty types", () => {
  itGeneratesDSLsToMatchSnapshtos("empty_types", ["empty_types/empty_pb_nexus.ts"]);
});