import { itGeneratesDSLsToMatchSnapshtos } from "./__helpers__/process.test.helper";

describe("import squashed union", () => {
  itGeneratesDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg1", [
    "edgecases/import_squashed_union/pkg1/types.pb.pothos.ts",
  ]);
  itGeneratesDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg2", [
    "edgecases/import_squashed_union/pkg2/types.pb.pothos.ts",
  ]);
});
