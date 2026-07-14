import type { DescFile } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";
import {
  collectOperationsFromFile,
  collectTypesFromFile,
  createRegistryFromSchema,
  fileHasExposedRpcs,
  filenameFromProtoFile,
} from "@proto-graphql/codegen-core";
import type { Options } from "@proto-graphql/protoc-plugin-helpers";

import {
  createOperationDslPrintables,
  createTypeDslPrintables,
} from "./dslgen/index.js";

const allowedProtobufs = ["ts-proto", "protobuf-es-v1", "protobuf-es"];

export function generateFiles(
  schema: Schema<Options<"pothos">>,
  file: DescFile,
): void {
  const opts = schema.options;

  if (!allowedProtobufs.includes(opts.printer.protobuf)) {
    opts.printer.protobuf = "ts-proto"; // default
  }

  // R1.4: `(graphql.rpc).operation` requires the protobuf-es v2 runtime
  // (Connect-ES v2). Detect any explicitly-annotated RPC before collecting so
  // any other runtime fails with a clear message instead of emitting broken
  // resolvers.
  if (fileHasExposedRpcs(file) && opts.printer.protobuf !== "protobuf-es") {
    throw new Error(
      `${file.name}: (graphql.rpc).operation requires protobuf_lib=protobuf-es (protobuf-es v2), but protobuf_lib=${opts.printer.protobuf}. RPC-to-Query/Mutation generation only supports protobuf-es v2 (Connect-ES v2). Remove (graphql.rpc).operation from the file's RPCs, or switch the plugin to protobuf_lib=protobuf-es.`,
    );
  }

  const registry = createRegistryFromSchema(schema);
  const types = collectTypesFromFile(file, opts.type, schema.allFiles);

  const { operations, warnings, errors } = collectOperationsFromFile(
    file,
    opts.type,
    schema.allFiles,
  );
  // Each error already carries its `<service>.<method>` reference (S1-C).
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  // protoc plugins may write freely to stderr; surface every skipped/streaming
  // RPC without failing the run.
  for (const warning of warnings) {
    process.stderr.write(`${warning}\n`);
  }

  const f = schema.generateFile(filenameFromProtoFile(file, opts.printer));
  const printables = [
    ...createTypeDslPrintables(types, registry, opts.printer),
    ...createOperationDslPrintables(
      operations,
      opts.printer,
      opts.runtimeModule,
    ),
  ];

  // ヘッダー出力（preamble プロパティに格納される）
  f.preamble(file);

  if (printables.length === 0) {
    f.print("export {};");
    return;
  }

  // 各型の Printable を直接出力
  for (const p of printables) {
    f.print(...p);
    f.print(); // 空行で区切り
  }
}
