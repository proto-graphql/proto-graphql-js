import { itGeneratesNexusDSLsToMatchSnapshtos } from "./__helpers__/process.test.helper";

describe("proto3 optional", () => {
  itGeneratesNexusDSLsToMatchSnapshtos("testapis.proto3_optional", [
    "proto3_optional/proto3_optional_pb_nexus.ts",
  ]);
});
