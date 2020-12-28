import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration(["multipkgs/subpkg1", "multipkgs/subpkg2"], "protobufjs");
testSchemaGeneration(
  ["multipkgs/subpkg1", "multipkgs/subpkg2"],
  "native protobuf"
);
