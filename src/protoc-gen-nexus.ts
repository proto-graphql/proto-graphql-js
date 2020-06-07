import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printSource } from "./printer";
import { Message } from "./types";
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

function processFileDescriptor(fd: FileDescriptorProto): string {
  const msgs: Message[] = [];

  for (const d of fd.getMessageTypeList()) {
    msgs.push(new Message(d));
  }

  for (const l of fd.getSourceCodeInfo()?.getLocationList() || []) {
    const pathList = l.getPathList()!;
    if (pathList[0] === 4) {
      msgs[pathList[1]].addSourceCodeInfoLocation(l);
    }
  }

  return printSource(fd, msgs);
}
