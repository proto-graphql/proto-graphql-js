import { promises as fs } from "fs";
import { join } from "path";

import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";

import { processRequest } from "../../process";

const generationTargets = ["native protobuf", "protobufjs"] as const;
type GenerationTarget = typeof generationTargets[number];

export async function generateDSLs(
  name: string,
  target: GenerationTarget,
  opts: {
    withPrefix?: boolean;
    perGraphQLType?: boolean;
    partialInputs?: boolean;
  } = {}
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
          "import_prefix=@proto-graphql/e2e-testapis-google-protobuf/lib"
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
  return await processCodeGeneration(name, params.join(","));
}

export function itGeneratesNexusDSLsToMatchSnapshtos(
  name: string,
  expectedGeneratedFiles: string[]
) {
  describe.each(generationTargets)("with %s", (target) => {
    it("generates nexus DSLs", async () => {
      const resp = await generateDSLs(name, target);
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

export async function processCodeGeneration(
  name: string,
  param?: string
): Promise<CodeGeneratorResponse> {
  const req = await buildCodeGeneratorRequest(name);
  if (param) {
    req.setParameter(param);
  }
  return processRequest(req);
}

async function getFixtureFileDescriptorSet(
  name: string
): Promise<FileDescriptorSet> {
  const buf = await fs.readFile(
    join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "..",
      "devPackages",
      "testapis-proto",
      "src",
      "testapis",
      name,
      "descriptor_set.pb"
    )
  );
  return FileDescriptorSet.deserializeBinary(buf);
}

async function buildCodeGeneratorRequest(
  name: string
): Promise<CodeGeneratorRequest> {
  const descSet = await getFixtureFileDescriptorSet(name);
  const req = new CodeGeneratorRequest();

  for (const fd of descSet.getFileList()) {
    req.addProtoFile(fd);

    const filename = fd.getName();
    if (filename && filename.startsWith(`testapis/${name}/`)) {
      req.addFileToGenerate(filename);
    }
  }

  return req;
}

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
}
