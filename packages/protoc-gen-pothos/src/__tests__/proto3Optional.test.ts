import { itGeneratesDSLsToMatchSnapshtos } from "./__helpers__/process.test.helper";

describe("proto3 optional", () => {
  itGeneratesDSLsToMatchSnapshtos("testapis.proto3_optional", [
    "proto3_optional/proto3_optional.pb.pothos.ts",
  ]);
});
