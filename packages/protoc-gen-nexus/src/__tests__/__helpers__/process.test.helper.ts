import { CodeGeneratorResponse } from "@bufbuild/protobuf";
import {
  buildCodeGeneratorRequest,
  TestapisPackage,
} from "@proto-graphql/testapis-proto";

import { protocGenNexus } from "../../plugin";

const generationTargets = ["native protobuf", "protobufjs"] as const;
type GenerationTarget = (typeof generationTargets)[number];

export function generateDSLs(
  pkg: TestapisPackage,
  target: GenerationTarget,
  opts: {
    withPrefix?: boolean;
    perGraphQLType?: boolean;
    partialInputs?: boolean;
  } = {},
) {
  const params = [];
  switch (target) {
    case "protobufjs":
      if (opts.withPrefix)
        params.push("import_prefix=@proto-graphql/e2e-testapis-protobufjs/lib");
      params.push("use_protobufjs");
      break;
    case "native protobuf":
      if (opts.withPrefix)
        params.push(
          "import_prefix=@proto-graphql/e2e-testapis-google-protobuf/lib",
        );
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
  return processCodeGeneration(pkg, params.join(","));
}

export function itGeneratesNexusDSLsToMatchSnapshtos(
  pkg: TestapisPackage,
  expectedGeneratedFiles: string[],
) {
  describe.each(generationTargets)("with %s", (target) => {
    it("generates nexus DSLs", () => {
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
    req.parameter += "," + param;
  }
  return protocGenNexus.run(req);
}

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp.file.reduce(
    (m, f) => ({ ...m, [f.name!]: f.content! }),
    {} as Record<string, string>,
  );
}
