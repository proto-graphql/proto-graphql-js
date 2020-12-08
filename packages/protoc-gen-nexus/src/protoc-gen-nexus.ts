import { CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { processFileDescriptor, Parameters } from "./process";
import { withCodeGeneratorRequest } from "./utils";

withCodeGeneratorRequest((req) => {
  const resp = new CodeGeneratorResponse();
  const files: Record<string, FileDescriptorProto> = {};

  for (const fd of req.getProtoFileList()) {
    files[fd.getName()!] = fd;
  }

  const params = parseParams(req.getParameter());

  for (const fn of req.getFileToGenerateList()) {
    const result = processFileDescriptor(files[fn], params);

    const file = new CodeGeneratorResponse.File();
    file.setContent(result);
    file.setName(fn.replace(/.proto$/, ".nexus.ts"));
    resp.addFile(file);
  }

  return resp;
});

const parseParams = (input: string | undefined) =>
  (input ?? "").split(",").reduce((o, kv) => {
    const [k, v] = kv.split("=", 2);
    o[k] = v;
    return o;
  }, {} as Parameters);
