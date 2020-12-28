import { promises as fs } from "fs";
import { join } from "path";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest } from "../../process";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";

export function itGeenratesNexusDSLsToMatchSnapshtos(
  name: string,
  expectedGeneratedFiles: string[]
) {
  it("generates nexus DSL with native protobuf js_out", async () => {
    const resp = await processCodeGeneration(name);
    snapshotGeneratedFiles(resp, expectedGeneratedFiles);
  });

  it("generates nexus DSL with protobuf.js", async () => {
    const resp = await processCodeGeneration(name, "use_protobufjs");
    snapshotGeneratedFiles(resp, expectedGeneratedFiles);
  });
}

function snapshotGeneratedFiles(resp: CodeGeneratorResponse, files: string[]) {
  expect(Object.keys(resp.getFileList())).toHaveLength(files.length);

  const fileByName = getFileMap(resp);
  for (const filename of files) {
    const content = fileByName[`testapis/${filename}`];
    expect(content).toBeTruthy();
    expect(content).toMatchSnapshot(filename);
  }
}

async function processCodeGeneration(
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
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
}
