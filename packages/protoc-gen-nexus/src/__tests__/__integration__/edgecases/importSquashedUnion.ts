import { testSchemaGeneration } from "../../__helpers__/process.test.helper";

testSchemaGeneration(["edgecases/import_squashed_union/pkg1", "edgecases/import_squashed_union/pkg2"], "protobufjs");
testSchemaGeneration(
  ["edgecases/import_squashed_union/pkg1", "edgecases/import_squashed_union/pkg2"],
  "native protobuf"
);
