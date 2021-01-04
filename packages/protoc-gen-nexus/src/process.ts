import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { GenerationParams } from "./dslgen";
import { printSource } from "./printer";
import { ProtoRegistry } from "./protogen";

export const processRequest = (req: CodeGeneratorRequest): CodeGeneratorResponse => {
  const resp = new CodeGeneratorResponse();

  const registry = new ProtoRegistry();

  for (const fd of req.getProtoFileList()) {
    registry.addFile(fd);
  }

  const params = parseParams(req.getParameter());

  for (const fn of req.getFileToGenerateList()) {
    const file = registry.findFile(fn);
    if (file == null) throw new Error(`${fn} is not found`);
    const result = printSource(registry, file, params);

    const genfile = new CodeGeneratorResponse.File();
    genfile.setContent(result);
    genfile.setName(fn.replace(/.proto$/, "_pb_nexus.ts"));
    resp.addFile(genfile);
  }

  return resp;
};

// export for testing
export const parseParams = (input: string | undefined): GenerationParams => {
  const params: GenerationParams = {
    useProtobufjs: false,
    importPrefix: null,
  };

  if (!input) return params;

  const toBool = (name: string, v: string | undefined): boolean => {
    if (!v || v === "true") return true;
    if (v === "false") return false;
    throw new Error(`${name} should be bool, got string: ${v}`);
  };
  const toString = (name: string, v: string | undefined): string => {
    if (!v) throw new Error(`${name} should be string`);
    return v;
  };

  for (const kv of input.split(",")) {
    const [k, v] = kv.split("=", 2);
    switch (k) {
      case "use_protobufjs":
        params.useProtobufjs = toBool(k, v);
        break;
      case "import_prefix":
        params.importPrefix = toString(k, v);
        break;
      default:
        throw new Error(`unknown param: ${kv}`);
    }
  }

  return params;
};
