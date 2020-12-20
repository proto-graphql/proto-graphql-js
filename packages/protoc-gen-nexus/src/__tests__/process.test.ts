import { readFileSync } from "fs";
import { join } from "path";
import { FileDescriptorSet } from "google-protobuf/google/protobuf/descriptor_pb";
import { processRequest } from "../process";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";

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

function getFileMap(resp: CodeGeneratorResponse): Record<string, string> {
  return resp
    .getFileList()
    .reduce(
      (m, f) => ({ ...m, [f.getName()!]: f.getContent()! }),
      {} as Record<string, string>
    );
}

test("generates nexus DSL from simple proto file", () => {
  const req = buildCodeGeneratorRequest("hello");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["hello/hello_pb_nexus.ts"]).toMatchSnapshot();
});

test("generates nexus DSL from proto well-known types", () => {
  const req = buildCodeGeneratorRequest("wktypes");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["wktypes/well_known_types_pb_nexus.ts"]).toMatchSnapshot();
});

test("generates nexus DSL from enum proto types", () => {
  const req = buildCodeGeneratorRequest("enums");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["enums/enums_pb_nexus.ts"]).toMatchSnapshot();
});

test("generates nexus DSL from nested proto types", () => {
  const req = buildCodeGeneratorRequest("nested");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["nested/nested_pb_nexus.ts"]).toMatchSnapshot();
});

test("generates nexus DSL with proto custom options", () => {
  const req = buildCodeGeneratorRequest("extensions");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["extensions/extensions_pb_nexus.ts"]).toMatchSnapshot();
});

test("generates nexus DSL of union type with proto oneofs", () => {
  const req = buildCodeGeneratorRequest("oneof");
  const resp = processRequest(req);

  expect(Object.keys(resp.getFileList())).toHaveLength(1);

  const fileByName = getFileMap(resp);

  expect(fileByName["oneof/oneof_pb_nexus.ts"]).toMatchSnapshot();
});
