import {
  collectTypesFromFile,
  filename,
  filenameFromProtoFile,
  printCodes,
  TypeOptions,
} from "@proto-graphql/codegen-core";
import { ProtoFile, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import { Code } from "ts-poet";
import { createTypeDslCodes } from "./dslgen";
import { PothosPrinterOptions } from "./dslgen/printers/util";

export function generateFiles(
  registry: ProtoRegistry,
  file: ProtoFile,
  opts: { type: TypeOptions; printer: PothosPrinterOptions }
): { filename: string; content: string }[] {
  opts.printer.protobuf = "ts-proto"; // default

  const types = collectTypesFromFile(file, opts.type, registry);

  switch (opts.printer.fileLayout) {
    case "proto_file": {
      return [
        {
          filename: filenameFromProtoFile(file, opts.printer),
          content: printCodes(createCodes(types, opts.printer), "protoc-gen-pothos", file),
        },
      ];
    }
    case "graphql_type": {
      return types.map((t) => ({
        filename: filename(t, opts.printer),
        content: printCodes(createCodes([t], opts.printer), "protoc-gen-pothos", file),
      }));
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.printer.fileLayout;
      throw "unreachable";
    }
  }
}

function createCodes(types: ReturnType<typeof collectTypesFromFile>, opts: PothosPrinterOptions): Code[] {
  return [...createTypeDslCodes(types, opts)];
}
