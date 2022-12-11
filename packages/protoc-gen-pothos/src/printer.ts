import { collectTypesFromFile, DslFile, filename, GenerationParams, printCodes } from "@proto-graphql/codegen-core";
import { ProtoFile, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import { Code } from "ts-poet";
import { createTypeDslCodes } from "./dslgen";
import { PothosPrinterOptions } from "./dslgen/printers/util";

export function generateFiles(
  registry: ProtoRegistry,
  file: ProtoFile,
  origOpts: GenerationParams
): { filename: string; content: string }[] {
  const dslFile = new DslFile(file, { ...origOpts, dsl: "pothos", useTsProto: true });
  const types = collectTypesFromFile(dslFile, registry);
  const opts: PothosPrinterOptions = {
    dsl: "pothos",
    protobuf: "ts-proto",
    // protobuf: opts.useTsProto ? "ts-proto" : opts.useProtobufjs ? "protobufjs" : "google-protobuf",
    importPrefix: origOpts.importPrefix,
    fileLayout: origOpts.fileLayout,
    pothos: {
      builderPath: origOpts.pothosBuilderPath,
    },
  };

  switch (opts.fileLayout) {
    case "proto_file": {
      return [
        {
          filename: dslFile.filename,
          content: printCodes(createCodes(types, opts), "protoc-gen-pothos", file),
        },
      ];
    }
    case "graphql_type": {
      return types.map((t) => ({
        filename: filename(t, opts),
        content: printCodes(createCodes([t], opts), "protoc-gen-pothos", file),
      }));
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.fileLayout;
      throw "unreachable";
    }
  }
}

function createCodes(types: ReturnType<typeof collectTypesFromFile>, opts: PothosPrinterOptions): Code[] {
  return [...createTypeDslCodes(types, opts)];
}
