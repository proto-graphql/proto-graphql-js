import { generateDSLs, snapshotGeneratedFiles } from "./__helpers__/process.test.helper";

describe("no_partial", () => {
  it("generates nexus DSLs with partial inputs", async () => {
    const resp = await generateDSLs("extensions/no_partial", "native protobuf", { partialInputs: true });
    snapshotGeneratedFiles(resp, ["extensions/no_partial/no_partial_pb_nexus.ts"]);
  });
});
