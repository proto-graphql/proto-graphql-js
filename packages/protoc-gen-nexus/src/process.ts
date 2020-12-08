import { FileDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { printSource } from "./printer";
import { Message } from "./types";

export type Parameters = Record<string, string>;

export function processFileDescriptor(
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
