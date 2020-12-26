import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { printSource } from "./printer";
import { ProtoRegistry } from "./protoTypes";

export const processRequest = (
  req: CodeGeneratorRequest
): CodeGeneratorResponse => {
  const resp = new CodeGeneratorResponse();

  const registry = new ProtoRegistry();

  for (const fd of req.getProtoFileList()) {
    registry.addFile(fd);
  }

  const params = parseParams(req.getParameter());

  for (const fn of req.getFileToGenerateList()) {
    const result = printSource(registry, registry.findFile(fn), params);

    const file = new CodeGeneratorResponse.File();
    file.setContent(result);
    file.setName(fn.replace(/.proto$/, "_pb_nexus.ts"));
    resp.addFile(file);
  }

  return resp;
};

type Parameters = Record<string, string | boolean>;

const parseParams = (input: string | undefined) =>
  (input ?? "").split(",").reduce((o, kv) => {
    const [k, v] = kv.split("=", 2);
    o[k.replace(/(_[a-z])/g, (g) => g.toUpperCase().replace("_", ""))] =
      v ?? true;
    return o;
  }, {} as Parameters);
