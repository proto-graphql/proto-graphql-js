import { generateDSLs, snapshotGeneratedFiles } from "./__helpers__/process.test.helper";

describe("no_partial", () => {
  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs("extensions/no_partial", "ts-proto", { partialInputs: true });
    snapshotGeneratedFiles(resp, ["extensions/no_partial/no_partial_pb_nexus.ts"]);
  });
});

describe("field_nullability", () => {
  it("generates pothos DSLs with partial inputs", async () => {
    const resp = await generateDSLs("extensions/field_nullability", "ts-proto", { partialInputs: true });
    snapshotGeneratedFiles(resp, ["extensions/field_nullability/nullability_pb_nexus.ts"]);
  });
});
