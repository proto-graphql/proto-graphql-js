import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";
import { GenerationParams } from "./dslgen";
import { fileLayouts } from "./dslgen/types/util";
import { generateFiles } from "./printer";
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
    const results = generateFiles(registry, file, params);

    for (const result of results) {
      const genfile = new CodeGeneratorResponse.File();
      genfile.setContent(result.content);
      genfile.setName(result.filename);
      resp.addFile(genfile);
    }
  }

  return resp;
};

// export for testing
export const parseParams = (input: string | undefined): GenerationParams => {
  const params: GenerationParams = {
    useProtobufjs: false,
    partialInputs: false,
    importPrefix: null,
    fileLayout: "proto_file",
    typeMappings: {
      "google.protobuf.Int32Value": "Int",
      "google.protobuf.Int64Value": "String",
      "google.protobuf.UInt32Value": "Int",
      "google.protobuf.UInt64Value": "String",
      "google.protobuf.FloatValue": "Float",
      "google.protobuf.DoubleValue": "Float",
      "google.protobuf.BoolValue": "Boolean",
      "google.protobuf.StringValue": "String",
      "google.protobuf.Timestamp": "DateTime",
    },
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

  function checkEnum<T extends string>(v: string, whitelist: ReadonlyArray<T>): v is T {
    return whitelist.includes(v as any);
  }

  for (const kv of input.split(",")) {
    const [k, v] = kv.split("=", 2);
    switch (k) {
      case "use_protobufjs":
        params.useProtobufjs = toBool(k, v);
        break;
      case "import_prefix":
        params.importPrefix = toString(k, v);
        break;
      case "partial_inputs":
        params.partialInputs = toBool(k, v);
        break;
      case "file_layout": {
        const s = toString(k, v);
        if (!checkEnum(s, fileLayouts)) {
          throw new Error(`file_layout should be ${fileLayouts.map((s) => `"${s}"`).join(", ")}`);
        }
        params.fileLayout = s;
        break;
      }
      default:
        throw new Error(`unknown param: ${kv}`);
    }
  }

  return params;
};
