import { readFileSync } from "fs";
import { join } from "path";
import {
  FileDescriptorProto,
  FileDescriptorSet,
} from "google-protobuf/google/protobuf/descriptor_pb";
import { processFileDescriptor } from "../process";

function getFixtureFileDescriptor(name: string): FileDescriptorProto {
  const buf = readFileSync(
    join(__dirname, "..", "__fixtures__", "fixtures.protoset")
  );
  const set = FileDescriptorSet.deserializeBinary(buf);
  const fd = set.getFileList().find((fd) => fd.getName() === name);
  // eslint-disable-next-line eqeqeq
  if (fd == null) {
    throw `${name} was not found`;
  }
  return fd;
}

test("geenrates nexus DSL from simple proto file", () => {
  const fd = getFixtureFileDescriptor("sample.proto");
  expect(processFileDescriptor(fd, {})).toMatchSnapshot();
});
