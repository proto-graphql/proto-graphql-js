import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printSource } from "./printer";
import { Message } from "./types";

export const processRequest = (
  req: CodeGeneratorRequest
): CodeGeneratorResponse => {
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
    file.setName(fn.replace(/.proto$/, "_nexus_pb.ts"));
    resp.addFile(file);
  }

  return resp;
};

type Parameters = Record<string, string>;

const parseParams = (input: string | undefined) =>
  (input ?? "").split(",").reduce((o, kv) => {
    const [k, v] = kv.split("=", 2);
    o[k] = v;
    return o;
  }, {} as Parameters);

function processFileDescriptor(
  fd: FileDescriptorProto,
  params: Parameters
): string {
  const msgs: Message[] = [];

  for (const d of fd.getMessageTypeList()) {
    msgs.push(new Message(fd, d, { importPrefix: params.importPrefix }));
  }

  for (const l of fd.getSourceCodeInfo()?.getLocationList() || []) {
    const pathList = l.getPathList()!;
    if (pathList[0] === 4) {
      msgs[pathList[1]].addSourceCodeInfoLocation(l);
    }
  }

  return printSource(fd, msgs);
}
