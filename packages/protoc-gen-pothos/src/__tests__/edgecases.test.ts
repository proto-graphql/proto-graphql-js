import { itGeneratesPothosDSLsToMatchSnapshtos } from "./__helpers__/process.test.helper";

describe("import squashed union", () => {
  itGeneratesPothosDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg1", [
    "edgecases/import_squashed_union/pkg1/types_pb_nexus.ts",
  ]);
  itGeneratesPothosDSLsToMatchSnapshtos("edgecases/import_squashed_union/pkg2", [
    "edgecases/import_squashed_union/pkg2/types_pb_nexus.ts",
  ]);
});
