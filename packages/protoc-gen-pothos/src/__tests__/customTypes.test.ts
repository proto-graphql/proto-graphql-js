import {
  processCodeGeneration,
  snapshotGeneratedFiles,
} from "./__helpers__/process.test.helper";

describe("custom types", () => {
  it("generates pothos DSLs", async () => {
    const resp = await processCodeGeneration(
      "custom_types",
      "custom_type=testapis.custom_types.Date=Date"
    );
    snapshotGeneratedFiles(resp, [
      "custom_types/post.pb.pothos.ts",
      "custom_types/date.pb.pothos.ts",
    ]);
  });
});
