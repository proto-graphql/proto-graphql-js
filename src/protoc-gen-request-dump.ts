import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { withCodeGeneratorRequest } from "./utils";

withCodeGeneratorRequest((req) => {
  const resp = new CodeGeneratorResponse();

  const files: Record<string, FileDescriptorProto> = {};

  for (const fd of req.getProtoFileList()) {
    files[fd.getName()!] = fd;
  }

  for (const fn of req.getFileToGenerateList()) {
    const file = new CodeGeneratorResponse.File();
    file.setName(`${fn}.dump`);
    file.setContent(
      Buffer.from(files[fn].serializeBinary()).toString("base64"),
    );
    resp.addFile(file);
  }

  return resp;
});
