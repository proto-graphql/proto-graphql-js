import type { CodeGeneratorResponse } from "@bufbuild/protobuf";
import {
  type TestapisPackage,
  buildCodeGeneratorRequest,
} from "@proto-graphql/testapis-proto";

import { protocGenPothos } from "../../plugin";

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
  } = {},
) {
  const params = [];
  switch (target) {
    case "ts-proto":
    case "ts-proto-with-forcelong-long":
    case "ts-proto-with-forcelong-number": {
      if (opts.withPrefix) params.push(`import_prefix=@testapis/${target}/lib`);
      break;
    }
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
  expectedGeneratedFiles: string[],
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
  files: string[],
) {
  expect(Object.keys(resp.file)).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

export function processCodeGeneration(
  pkg: TestapisPackage,
  param?: string,
): CodeGeneratorResponse {
  const req = buildCodeGeneratorRequest(pkg);
  req.parameter = "target=ts";
  if (param) {
    req.parameter += `,${param}`;
  }

  return protocGenPothos.run(req);
}

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp.file.reduce(
    // biome-ignore lint/style/noNonNullAssertion: definitely non-null
    (m, f) => Object.assign(m, { [f.name!]: f.content! }),
    {} as Record<string, string>,
  );
}
