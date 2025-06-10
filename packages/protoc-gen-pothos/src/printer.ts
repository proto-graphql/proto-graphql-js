import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectTypesFromFile,
  createRegistryFromSchema,
  filename,
  filenameFromProtoFile,
} from "@proto-graphql/codegen-core";
import type { Options } from "@proto-graphql/protoc-plugin-helpers";

import { printTypeDsl } from "./dslgen/index.js";

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
      printTypeDsl(f, types, registry, opts.printer);
      break;
    }
    case "graphql_type": {
      for (const t of types) {
        const f = schema.generateFile(filename(t, opts.printer));
        printTypeDsl(f, [t], registry, opts.printer);
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
