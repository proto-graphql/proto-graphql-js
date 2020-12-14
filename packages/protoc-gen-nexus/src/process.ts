import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printSource } from "./printer";
import { ProtoFile, ProtoMessage, ProtoEnum } from "./protoTypes";

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
    file.setName(fn.replace(/.proto$/, "_pb_nexus.ts"));
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

  const [msgs, enums] = collectTypes(file.messages);
  enums.push(...file.enums);

  return printSource(fd, msgs, enums, params);
}

function collectTypes(inputs: ProtoMessage[]): [ProtoMessage[], ProtoEnum[]] {
  const msgs: ProtoMessage[] = [];
  const enums: ProtoEnum[] = [];

  for (const input of inputs) {
    const [childMsgs, childEnums] = collectTypes(input.messages);
    msgs.push(input, ...childMsgs);
    enums.push(...input.enums, ...childEnums);
  }

  return [msgs, enums];
}
