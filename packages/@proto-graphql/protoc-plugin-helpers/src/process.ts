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

    for (const file of getFilesToGenerate(req, registry)) {
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

function getFilesToGenerate(
  req: CodeGeneratorRequest,
  reg: ProtoRegistry
): ProtoFile[] {
  const filesToGenerateSet = new Set(req.getFileToGenerateList());
  return req
    .getProtoFileList()
    .map((f) => f.getName())
    .filter(isDefined)
    .filter((n) => filesToGenerateSet.has(n))
    .map((n) => reg.findFile(n))
    .filter(isNotNull)
    .filter((f) => !isWellKnownTypesFile(f));
}

function isDefined<V>(v: V | undefined): v is V {
  return v !== undefined;
}

function isNotNull<V>(v: V | null): v is V {
  return v !== null;
}

function isWellKnownTypesFile(f: ProtoFile): boolean {
  return f.name.startsWith("google/protobuf/");
}
