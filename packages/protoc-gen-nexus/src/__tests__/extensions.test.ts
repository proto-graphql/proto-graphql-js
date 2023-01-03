import {
  generateDSLs,
  snapshotGeneratedFiles,
} from "./__helpers__/process.test.helper";

describe("no_partial", () => {
  it("generates nexus DSLs with partial inputs", async () => {
    const resp = await generateDSLs(
      "testapis.extensions.no_partial",
      "native protobuf",
      { partialInputs: true }
    );
    snapshotGeneratedFiles(resp, [
      "extensions/no_partial/no_partial_pb_nexus.ts",
    ]);
  });
});

describe("field_nullability", () => {
  it("generates nexus DSLs with partial inputs", async () => {
    const resp = await generateDSLs(
      "testapis.extensions.field_nullability",
      "native protobuf",
      { partialInputs: true }
    );
    snapshotGeneratedFiles(resp, [
      "extensions/field_nullability/nullability_pb_nexus.ts",
    ]);
  });
});
