import { collectTypesFromFile, DslFile, filename, GenerationParams, printCodes } from "@proto-graphql/codegen-core";
import { ProtoFile, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import { Code } from "ts-poet";
import { createTypeDslCodes } from "./dslgen";
import { NexusPrinterOptions } from "./dslgen/printers/util";

export function generateFiles(
  registry: ProtoRegistry,
  file: ProtoFile,
  origOpts: GenerationParams
): { filename: string; content: string }[] {
  const dslFile = new DslFile(file, { ...origOpts, dsl: "nexus" });
  const types = collectTypesFromFile(dslFile, registry);
  const opts: NexusPrinterOptions = {
    dsl: "nexus",
    protobuf: origOpts.useProtobufjs ? "protobufjs" : "google-protobuf",
    importPrefix: origOpts.importPrefix,
    fileLayout: origOpts.fileLayout,
  };

  switch (opts.fileLayout) {
    case "proto_file": {
      return [
        {
          filename: dslFile.filename,
          content: printCodes(createCodes(types, opts), "protoc-gen-nexus", file),
        },
      ];
    }
    case "graphql_type": {
      return types.map((t) => ({
        filename: filename(t, opts),
        content: printCodes(createCodes([t], opts), "protoc-gen-nexus", file),
      }));
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.fileLayout;
      throw "unreachable";
    }
  }
}

function createCodes(types: ReturnType<typeof collectTypesFromFile>, opts: NexusPrinterOptions): Code[] {
  return [...createTypeDslCodes(types, opts)];
}
