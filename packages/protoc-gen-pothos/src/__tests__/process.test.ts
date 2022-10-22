import {
  itGeneratesDSLsToMatchSnapshtos,
  generateDSLs,
  snapshotGeneratedFiles,
} from "./__helpers__/process.test.helper";

describe("simple proto file", () => {
  itGeneratesDSLsToMatchSnapshtos("primitives", ["primitives/primitives.pb.pothos.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("primitives", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "primitives/Message.pothos.ts",
      "primitives/Primitives.pothos.ts",
      "primitives/MessageInput.pothos.ts",
      "primitives/PrimitivesInput.pothos.ts",
    ]);
  });

  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs("primitives", "ts-proto", { partialInputs: true });
    snapshotGeneratedFiles(resp, ["primitives/primitives.pb.pothos.ts"]);
  });
});

describe("well-known protobuf types", () => {
  itGeneratesDSLsToMatchSnapshtos("wktypes", ["wktypes/well_known_types.pb.pothos.ts"]);
});

describe("protobuf enums", () => {
  itGeneratesDSLsToMatchSnapshtos("enums", ["enums/enums.pb.pothos.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("enums", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "enums/MessageWithEnums.pothos.ts",
      "enums/MyEnum.pothos.ts",
      "enums/MyEnumWithoutUnspecified.pothos.ts",
      "enums/MessageWithEnumsInput.pothos.ts",
    ]);
  });
});

describe("nested protobuf types", () => {
  itGeneratesDSLsToMatchSnapshtos("nested", ["nested/nested.pb.pothos.ts"]);
});

describe("protobuf custom options", () => {
  itGeneratesDSLsToMatchSnapshtos("extensions", [
    "extensions/extensions.pb.pothos.ts",
    "extensions/ignored.pb.pothos.ts",
  ]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("extensions", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "extensions/TestPrefixPrefixedMessage.pothos.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage.pothos.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage2.pothos.ts",
      "extensions/TestPrefixPrefixedMessageSquashedMessage.pothos.ts",
      "extensions/TestPrefixPrefixedMessagePartialIgnoreOneof.pothos.ts",
      "extensions/TestPrefixPrefixedEnum.pothos.ts",
      "extensions/TestPrefixIgnoredMessageNotIgnored.pothos.ts",
      "extensions/TestPrefixInterfaceMessage.pothos.ts",
      "extensions/TestPrefixInterfaceMessageType.pothos.ts",
      "extensions/TestPrefixRenamedMessage.pothos.ts",
      "extensions/TestPrefixPrefixedMessageInput.pothos.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessageInput.pothos.ts",
      "extensions/TestPrefixPrefixedMessageInnerMessage2Input.pothos.ts",
      "extensions/TestPrefixPrefixedMessageSquashedMessageInput.pothos.ts",
      "extensions/TestPrefixIgnoredMessageNotIgnoredInput.pothos.ts",
      "extensions/TestPrefixInterfaceMessageInput.pothos.ts",
      "extensions/TestPrefixRenamedMessageInput.pothos.ts",
    ]);
  });
});

describe("protobuf oneof", () => {
  itGeneratesDSLsToMatchSnapshtos("oneof", ["oneof/oneof.pb.pothos.ts"]);

  it("generates pothos DSLs with graphql_type file layout", async () => {
    const resp = await generateDSLs("oneof", "ts-proto", { perGraphQLType: true });
    snapshotGeneratedFiles(resp, [
      "oneof/OneofParent.pothos.ts",
      "oneof/OneofParentRequiredOneofMembers.pothos.ts",
      "oneof/OneofParentOptionalOneofMembers.pothos.ts",
      "oneof/OneofMemberMessage1.pothos.ts",
      "oneof/OneofMemberMessage2.pothos.ts",
      "oneof/OneofParentInput.pothos.ts",
      "oneof/OneofMemberMessage1Input.pothos.ts",
      "oneof/OneofMemberMessage2Input.pothos.ts",
    ]);
  });
});

describe("multipkgs", () => {
  itGeneratesDSLsToMatchSnapshtos("multipkgs/subpkg1", ["multipkgs/subpkg1/types.pb.pothos.ts"]);
  itGeneratesDSLsToMatchSnapshtos("multipkgs/subpkg2", ["multipkgs/subpkg2/types.pb.pothos.ts"]);
});

describe("deprecation", () => {
  itGeneratesDSLsToMatchSnapshtos("deprecation", [
    "deprecation/deprecation.pb.pothos.ts",
    "deprecation/file_deprecation.pb.pothos.ts",
  ]);
});

describe("field_behavior", () => {
  itGeneratesDSLsToMatchSnapshtos("field_behavior", ["field_behavior/comments.pb.pothos.ts"]);
});

describe("empty types", () => {
  itGeneratesDSLsToMatchSnapshtos("empty_types", ["empty_types/empty.pb.pothos.ts"]);
});
