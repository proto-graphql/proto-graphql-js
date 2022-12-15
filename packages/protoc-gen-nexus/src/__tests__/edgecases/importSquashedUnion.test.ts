import { itGeneratesNexusDSLsToMatchSnapshtos } from "../__helpers__/process.test.helper";

describe("import squashed union", () => {
  itGeneratesNexusDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg1", [
    "edgecases/import_squashed_union/pkg1/types_pb_nexus.ts",
  ]);
  itGeneratesNexusDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg2", [
    "edgecases/import_squashed_union/pkg2/types_pb_nexus.ts",
  ]);
});
