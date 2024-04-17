import { DescFile } from "@bufbuild/protobuf";
import { Schema } from "@bufbuild/protoplugin/ecmascript";
import {
  collectTypesFromFile,
  filename,
  filenameFromProtoFile,
  printCodes,
  TypeOptions,
} from "@proto-graphql/codegen-core";
import { Code } from "ts-poet";

import { createTypeDslCodes } from "./dslgen";
import { PothosPrinterOptions } from "./dslgen/printers/util";

export function generateFiles(
  schema: Schema,
  file: DescFile,
  opts: { type: TypeOptions; printer: PothosPrinterOptions }
): void {
  opts.printer.protobuf = "ts-proto"; // default

  const types = collectTypesFromFile(file, opts.type, schema.allFiles);

  switch (opts.printer.fileLayout) {
    case "proto_file": {
      const f = schema.generateFile(filenameFromProtoFile(file, opts.printer));

      const code = printCodes(
        createCodes(types, opts.printer),
        "protoc-gen-pothos",
        file
      );
      f.print(code.trimEnd());
      break;
    }
    case "graphql_type": {
      for (const t of types) {
        const f = schema.generateFile(filename(t, opts.printer));
        const code = printCodes(
          createCodes([t], opts.printer),
          "protoc-gen-pothos",
          file
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
  opts: PothosPrinterOptions
): Code[] {
  return [...createTypeDslCodes(types, opts)];
}
