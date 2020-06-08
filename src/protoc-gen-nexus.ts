import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { processFileDescriptor } from "./process";
import { withCodeGeneratorRequest } from "./utils";

withCodeGeneratorRequest((req) => {
  const resp = new CodeGeneratorResponse();
  const files: Record<string, FileDescriptorProto> = {};

  for (const fd of req.getProtoFileList()) {
    files[fd.getName()!] = fd;
  }

  for (const fn of req.getFileToGenerateList()) {
    const result = processFileDescriptor(files[fn]);

    const file = new CodeGeneratorResponse.File();
    file.setContent(result);
    file.setName(fn.replace(/.proto$/, ".nexus.ts"));
    resp.addFile(file);
  }

  return resp;
});
