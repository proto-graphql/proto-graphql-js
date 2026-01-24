import {
  buildCodeGeneratorRequest,
  type TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { protocGenPothos } from "../../../plugin.js";
import type { TestCase, Runtime } from "./testCaseDiscovery.js";

export interface GeneratedFile {
  name: string;
  content: string;
}

export interface CodeGenerationResult {
  files: GeneratedFile[];
  error?: string;
}

function getImportPrefix(runtime: Runtime, runtimeVariant: string): string {
  if (runtimeVariant === "ts-proto-forcelong") {
    return "@proto-graphql/e2e-testapis-ts-proto-with-forcelong-number/lib/";
  }
  switch (runtime) {
    case "ts-proto":
      return "@proto-graphql/e2e-testapis-ts-proto/lib/";
    case "protobuf-es-v1":
      return "@proto-graphql/e2e-testapis-protobuf-es/lib/";
    case "protobuf-es":
      return "@proto-graphql/e2e-testapis-protobuf-es-v2/lib/";
  }
}

const tsProtoInt64StringScalars = [
  "scalar=int64=String",
  "scalar=uint64=String",
  "scalar=sint64=String",
  "scalar=fixed64=String",
  "scalar=sfixed64=String",
  "scalar=google.protobuf.Int64Value=String",
  "scalar=google.protobuf.UInt64Value=String",
  "scalar=google.protobuf.SInt64Value=String",
  "scalar=google.protobuf.Fixed64Value=String",
  "scalar=google.protobuf.SFixed64Value=String",
];

const tsProtoInt64IntScalars = [
  "scalar=int64=Int",
  "scalar=uint64=Int",
  "scalar=sint64=Int",
  "scalar=fixed64=Int",
  "scalar=sfixed64=Int",
  "scalar=google.protobuf.Int64Value=Int",
  "scalar=google.protobuf.UInt64Value=Int",
  "scalar=google.protobuf.SInt64Value=Int",
  "scalar=google.protobuf.Fixed64Value=Int",
  "scalar=google.protobuf.SFixed64Value=Int",
];

export function buildPluginParam(testCase: TestCase): string | undefined {
  const { runtime, runtimeVariant, param } = testCase.config;

  const parts: string[] = [];

  parts.push(`import_prefix=${getImportPrefix(runtime, runtimeVariant)}`);
  parts.push("pothos_builder_path=../builder");

  if (runtime === "protobuf-es-v1") {
    parts.push("protobuf_lib=protobuf-es-v1");
  } else if (runtime === "protobuf-es") {
    parts.push("protobuf_lib=protobuf-es");
  } else if (runtime === "ts-proto") {
    if (runtimeVariant === "ts-proto-forcelong") {
      parts.push(...tsProtoInt64IntScalars);
    } else {
      parts.push(...tsProtoInt64StringScalars);
    }
  }

  if (param) {
    parts.push(param);
  }

  return parts.join(",");
}

export function executeGeneration(testCase: TestCase): CodeGenerationResult {
  const { package: pkg, prefixMatch } = testCase.config;
  const param = buildPluginParam(testCase);

  try {
    const req = buildCodeGeneratorRequest(pkg as TestapisPackage, { param, prefixMatch });
    const resp = protocGenPothos.run(req);

    const files: GeneratedFile[] = resp.file.map((f) => ({
      name: f.name ?? "",
      content: f.content ?? "",
    }));

    return { files };
  } catch (error) {
    return {
      files: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
