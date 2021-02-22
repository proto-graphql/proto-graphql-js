import { testSchemaGeneration } from "../__helpers__/process.test.helper";

testSchemaGeneration("empty_types", "native protobuf");
testSchemaGeneration("empty_types", "protobufjs");
