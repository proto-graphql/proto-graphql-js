import { itGeneratesDSLsToMatchSnapshtos } from "../__helpers__/process.test.helper";

describe("import type form the same package", () => {
  itGeneratesDSLsToMatchSnapshtos("testapis.edgecases.import_from_same_pkg", [
    "edgecases/import_from_same_pkg/parent.pb.pothos.ts",
    "edgecases/import_from_same_pkg/child.pb.pothos.ts",
  ]);
});
