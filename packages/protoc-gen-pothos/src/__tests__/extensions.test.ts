import {
  generateDSLs,
  snapshotGeneratedFiles,
} from "./__helpers__/process.test.helper";

describe("no_partial", () => {
  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs(
      "testapis.extensions.no_partial",
      "ts-proto",
      {
        partialInputs: true,
      },
    );
    snapshotGeneratedFiles(resp, [
      "extensions/no_partial/no_partial.pb.pothos.ts",
    ]);
  });
});

describe("field_nullability", () => {
  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs(
      "testapis.extensions.field_nullability",
      "ts-proto",
      { partialInputs: true },
    );
    snapshotGeneratedFiles(resp, [
      "extensions/field_nullability/nullability.pb.pothos.ts",
    ]);
  });
});
