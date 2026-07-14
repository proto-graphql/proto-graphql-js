import {
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
  type PrinterOptions,
  protobufLibs,
  type TypeOptions,
} from "@proto-graphql/codegen-core";

export type Options<DSL extends PrinterOptions["dsl"]> = {
  type: TypeOptions;
  printer: Extract<PrinterOptions, { dsl: DSL }>;
  /**
   * Module the generated RPC operation resolvers import their runtime helpers
   * from: `getClient` from `<runtimeModule>` and `callRpc` from
   * `<runtimeModule>/graphql`. Defaults to `@proto-graphql/connect-runtime`.
   */
  runtimeModule: string;
  /**
   * When false, skip the in-plugin formatter pass over the generated
   * TypeScript. Useful when downstream tooling (Biome / Prettier) will format
   * the output anyway. Defaults to true.
   */
  format: boolean;
};

/**
 * Parsed `protoc-gen-dataloader` plugin parameters. See
 * docs/design/protoc-gen-dataloader/design.md §5.
 */
export interface DataloaderOptions {
  /** protobuf-es v2 generated module import path prefix. */
  importPrefix: string | null;
  /** Output file suffix, appended to the proto file's path. */
  filenameSuffix: string;
  /** Module `createRpcLoader` / `ProtoGraphqlConnectContext` are imported from. */
  runtimeModule: string;
  /** protoc-gen-pothos-compatible `emit_imported_files` semantics. */
  emitImportedFiles: boolean;
  /**
   * When false, skip the in-plugin formatter pass over the generated
   * TypeScript. Defaults to true.
   */
  format: boolean;
}

// Shared by parsePothosOptions / parseDataloaderOptions so both plugins parse
// `key=value` protoc plugin parameters the same way.
function boolParam(name: string, v: string): boolean {
  if (v === "" || v === "true") return true;
  if (v === "false") return false;
  throw new Error(`${name} should be bool, got string: ${v}`);
}

function stringParam(name: string, v: string | undefined): string {
  if (!v) throw new Error(`${name} should be string`);
  return v;
}

export function parsePothosOptions(
  rawOptions: { key: string; value: string }[],
): Options<"pothos"> {
  const params = {
    type: {
      partialInputs: false,
      scalarMapping: {},
      ignoreNonMessageOneofFields: false,
    } as TypeOptions,
    printer: {
      dsl: "pothos",
      protobuf: "ts-proto",
      importPrefix: null,
      emitImportedFiles: false,
      filenameSuffix: ".pb.pothos.ts",
      pothos: { builderPath: "./builder" },
    } as Extract<PrinterOptions, { dsl: "pothos" }>,
    runtimeModule: "@proto-graphql/connect-runtime",
    format: true,
  };

  function checkEnum<T extends string>(
    v: string,
    whitelist: readonly T[],
  ): v is T {
    return whitelist.includes(v as any);
  }

  for (const { key: k, value: v } of rawOptions) {
    switch (k) {
      case "protobuf_lib": {
        const s = stringParam(k, v);
        if (!checkEnum(s, protobufLibs)) {
          throw new Error(
            `protobuf_lib should be one of ${protobufLibs.join(", ")}`,
          );
        }
        params.printer.protobuf = s;
        break;
      }
      case "import_prefix": {
        params.printer.importPrefix = stringParam(k, v);
        break;
      }
      case "partial_inputs": {
        params.type.partialInputs = boolParam(k, v);
        break;
      }
      case "emit_imported_files": {
        params.printer.emitImportedFiles = boolParam(k, v);
        break;
      }
      case "scalar": {
        const idx = v.indexOf("=");
        const [protoType, gqlType] =
          idx === -1 ? [v, ""] : [v.slice(0, idx), v.slice(idx + 1)];
        params.type.scalarMapping[protoType] = gqlType;
        break;
      }
      case "pothos_builder_path": {
        (
          params.printer as Extract<PrinterOptions, { dsl: "pothos" }>
        ).pothos.builderPath = stringParam(k, v);
        break;
      }
      case "ignore_non_message_oneof_fields": {
        params.type.ignoreNonMessageOneofFields = true;
        break;
      }
      case "runtime_module": {
        params.runtimeModule = stringParam(k, v);
        break;
      }
      case "format": {
        params.format = boolParam(k, v);
        break;
      }
      case "target":
        // used by @bufbuild/protoplugin
        // no-op
        break;
      default:
        throw new Error(`unknown param: ${k}=${v}`);
    }
  }

  params.type.scalarMapping = {
    ...(params.printer.protobuf === "protobuf-es-v1" ||
    params.printer.protobuf === "protobuf-es"
      ? defaultScalarMapping
      : defaultScalarMappingForTsProto),
    ...params.type.scalarMapping,
  };

  return params;
}

export function parseDataloaderOptions(
  rawOptions: { key: string; value: string }[],
): DataloaderOptions {
  const params: DataloaderOptions = {
    importPrefix: null,
    filenameSuffix: ".pb.dataloader.ts",
    runtimeModule: "@proto-graphql/connect-runtime",
    emitImportedFiles: false,
    format: true,
  };

  for (const { key: k, value: v } of rawOptions) {
    switch (k) {
      case "import_prefix": {
        params.importPrefix = stringParam(k, v);
        break;
      }
      case "filename_suffix": {
        params.filenameSuffix = stringParam(k, v);
        break;
      }
      case "runtime_module": {
        params.runtimeModule = stringParam(k, v);
        break;
      }
      case "emit_imported_files": {
        params.emitImportedFiles = boolParam(k, v);
        break;
      }
      case "format": {
        params.format = boolParam(k, v);
        break;
      }
      case "target":
        // used by @bufbuild/protoplugin
        // no-op
        break;
      default:
        throw new Error(`unknown param: ${k}=${v}`);
    }
  }

  return params;
}
