import { readFileSync } from "fs";
import { join } from "path";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest } from "../process";
import { CodeGeneratorRequest } from "google-protobuf/google/protobuf/compiler/plugin_pb";

function getFixtureFileDescriptorSet(name: string): FileDescriptorSet {
  const buf = readFileSync(
    join(
      __dirname,
      "..",
      "..",
      "..",
      "@testapis",
      "proto",
      "src",
      name,
      "descriptor_set.pb"
    )
  );
  return FileDescriptorSet.deserializeBinary(buf);
}

function buildCodeGeneratorRequest(name: string): CodeGeneratorRequest {
  const descSet = getFixtureFileDescriptorSet(name);
  const req = new CodeGeneratorRequest();

  for (const fd of descSet.getFileList()) {
    req.addProtoFile(fd);

    const filename = fd.getName();
    if (filename && filename.startsWith(`${name}/`)) {
      req.addFileToGenerate(filename);
    }
  }

  return req;
}

test("geenrates nexus DSL from simple proto file", () => {
  const req = buildCodeGeneratorRequest("hello");
  const resp = processRequest(req);

  const fileByName: Record<string, string> = resp
    .getFileList()
    .reduce((m, f) => {
      m[f.getName()!] = f.getContent()!;
      return m;
    }, {} as Record<string, string>);

  expect(fileByName["hello/hello.nexus.ts"]).toMatchSnapshot();

  expect(Object.keys(fileByName)).toHaveLength(1);
});
