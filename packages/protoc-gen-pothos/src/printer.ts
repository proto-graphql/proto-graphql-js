import type { DescFile, Registry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectTypesFromFile,
  createRegistryFromSchema,
  filename,
  filenameFromProtoFile,
  printCodes,
} from "@proto-graphql/codegen-core";
import type { Code } from "ts-poet";

import type { Options } from "@proto-graphql/protoc-plugin-helpers";
import { createTypeDslCodes } from "./dslgen";
import type { PothosPrinterOptions } from "./dslgen/printers/util";

const allowedProtobufs = ["ts-proto", "protobuf-es"];

export function generateFiles(
  schema: Schema<Options<"pothos">>,
  file: DescFile,
): void {
  const opts = schema.options;

  if (!allowedProtobufs.includes(opts.printer.protobuf)) {
    opts.printer.protobuf = "ts-proto"; // default
  }

  const registry = createRegistryFromSchema(schema);
  const types = collectTypesFromFile(file, opts.type, schema.allFiles);

  switch (opts.printer.fileLayout) {
    case "proto_file": {
      const f = schema.generateFile(filenameFromProtoFile(file, opts.printer));

      const code = printCodes(
        createCodes(types, registry, opts.printer),
        "protoc-gen-pothos",
        file,
      );
      f.print(code.trimEnd());
      break;
    }
    case "graphql_type": {
      for (const t of types) {
        const f = schema.generateFile(filename(t, opts.printer));
        const code = printCodes(
          createCodes([t], registry, opts.printer),
          "protoc-gen-pothos",
          file,
        );
        f.print(code.trimEnd());
      }
      break;
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = opts.printer.fileLayout;
      throw "unreachable";
    }
  }
}

function createCodes(
  types: ReturnType<typeof collectTypesFromFile>,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code[] {
  return [...createTypeDslCodes(types, registry, opts)];
}
