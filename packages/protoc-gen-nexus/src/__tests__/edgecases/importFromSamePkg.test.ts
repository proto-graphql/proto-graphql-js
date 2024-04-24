import { itGeneratesNexusDSLsToMatchSnapshtos } from "../__helpers__/process.test.helper";

describe("import type form the same package", () => {
  itGeneratesNexusDSLsToMatchSnapshtos(
    "testapis.edgecases.import_from_same_pkg",
    [
      "edgecases/import_from_same_pkg/parent_pb_nexus.ts",
      "edgecases/import_from_same_pkg/child_pb_nexus.ts",
    ],
  );
});
