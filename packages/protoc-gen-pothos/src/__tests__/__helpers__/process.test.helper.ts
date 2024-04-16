import {
  buildCodeGeneratorRequest,
  TestapisPackage,
} from "@proto-graphql/testapis-proto";
import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";

import { processRequest } from "../../process";

const generationTargets = [
  "ts-proto",
  "ts-proto-with-forcelong-long",
  "ts-proto-with-forcelong-number",
] as const;
type GenerationTarget = (typeof generationTargets)[number];

export function generateDSLs(
  pkg: TestapisPackage,
  target: GenerationTarget,
  opts: {
    withPrefix?: boolean;
    perGraphQLType?: boolean;
    partialInputs?: boolean;
    scalars?: Record<string, string>;
  } = {}
) {
  const params = [];
  switch (target) {
    case "ts-proto":
    case "ts-proto-with-forcelong-long":
    case "ts-proto-with-forcelong-number":
      if (opts.withPrefix) params.push(`import_prefix=@testapis/${target}/lib`);
      break;
    default: {
      const _exhaustiveCheck: never = target;
      throw "unreachable";
    }
  }
  if (opts.perGraphQLType) {
    params.push("file_layout=graphql_type");
  }
  if (opts.partialInputs) {
    params.push("partial_inputs");
  }
  if (opts.scalars) {
    for (const [k, v] of Object.entries(opts.scalars)) {
      params.push(`scalar=${k}=${v}`);
    }
  }
  return processCodeGeneration(pkg, params.join(","));
}

export function itGeneratesDSLsToMatchSnapshtos(
  pkg: TestapisPackage,
  expectedGeneratedFiles: string[]
) {
  describe.each(["ts-proto"] as const)("with %s", (target) => {
    it("generates pothos DSLs", () => {
      const resp = generateDSLs(pkg, target);
      snapshotGeneratedFiles(resp, expectedGeneratedFiles);
    });
  });
}

export function snapshotGeneratedFiles(
  resp: CodeGeneratorResponse,
  files: string[]
) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

export function processCodeGeneration(
  pkg: TestapisPackage,
  param?: string
): CodeGeneratorResponse {
  const req = buildCodeGeneratorRequest(pkg);
  if (param) {
    req.setParameter(param);
  }
  return processRequest(req);
}

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
}
