import { PrinterOptions, TypeOptions } from "@proto-graphql/codegen-core";
import { ProtoFile, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import {
  CodeGeneratorRequest,
  CodeGeneratorResponse,
} from "google-protobuf/google/protobuf/compiler/plugin_pb";

import { parseParams } from "./parseParams";

export function createProcessor<DSL extends PrinterOptions["dsl"]>({
  generateFiles,
  dsl,
}: {
  generateFiles: (
    registry: ProtoRegistry,
    file: ProtoFile,
    opts: {
      type: TypeOptions;
      printer: Extract<PrinterOptions, { dsl: DSL }>;
    }
  ) => { filename: string; content: string }[];
  dsl: DSL;
}): (req: CodeGeneratorRequest) => CodeGeneratorResponse {
  return function processRequest(req: CodeGeneratorRequest) {
    const resp = new CodeGeneratorResponse();

    const registry = new ProtoRegistry();

    for (const fd of req.getProtoFileList()) {
      registry.addFile(fd);
    }

    const params = parseParams(req.getParameter(), dsl);

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
}
