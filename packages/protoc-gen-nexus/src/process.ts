import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printSource } from "./printer";
import { ProtoFile, ProtoMessage } from "./protoTypes";

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
    o[k.replace(/(_[a-z])/g, (g) => g.toUpperCase().replace("_", ""))] = v;
    return o;
  }, {} as Parameters);

function processFileDescriptor(
  fd: FileDescriptorProto,
  params: Parameters
): string {
  const file = new ProtoFile(fd);

  const msgs: ProtoMessage[] = [];

  for (const m of file.messages) {
    msgs.push(...collectMessages(m));
  }

  return printSource(fd, msgs, params);
}

function collectMessages(m: ProtoMessage): ProtoMessage[] {
  const msgs: ProtoMessage[] = [];

  msgs.push(m);
  for (const cm of m.messages) {
    msgs.push(...collectMessages(cm));
  }

  return msgs;
}
