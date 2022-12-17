import { LongNumberMapping } from "@proto-graphql/codegen-core";
import { promises as fs } from "fs";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { join } from "path";
import { processRequest } from "../../process";

const generationTargets = [
  "ts-proto",
  "ts-proto-with-forcelong-long",
  "ts-proto-with-forcelong-number",
] as const;
type GenerationTarget = typeof generationTargets[number];

export async function generateDSLs(
  name: string,
  target: GenerationTarget,
  opts: {
    withPrefix?: boolean;
    perGraphQLType?: boolean;
    partialInputs?: boolean;
    longNumber?: LongNumberMapping;
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
  if (opts.longNumber) {
    params.push(`long_number=${opts.longNumber}`);
  }
  return await processCodeGeneration(name, params.join(","));
}

export function itGeneratesDSLsToMatchSnapshtos(
  name: string,
  expectedGeneratedFiles: string[]
) {
  describe.each(["ts-proto"] as const)("with %s", (target) => {
    it("generates pothos DSLs", async () => {
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
      "@testapis",
      "proto",
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
}
