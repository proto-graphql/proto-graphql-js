import {
  type PrinterOptions,
  type TypeOptions,
  defaultScalarMapping,
  defaultScalarMappingForTsProto,
  fileLayouts,
  protobufLibs,
} from "@proto-graphql/codegen-core";

export function parseParams<DSL extends PrinterOptions["dsl"]>(
  input: string | undefined,
  dsl: DSL,
): {
  type: TypeOptions;
  printer: Extract<PrinterOptions, { dsl: DSL }>;
} {
  const params = {
    type: {
      partialInputs: false,
      scalarMapping: { ...defaultScalarMapping },
      ignoreNonMessageOneofFields: false,
    } as TypeOptions,
    printer: {
      dsl,
      protobuf: "google-protobuf",
      importPrefix: null,
      emitImportedFiles: false,
      fileLayout: "proto_file",
      filenameSuffix: dsl === "nexus" ? "_pb_nexus.ts" : ".pb.pothos.ts",
      pothos: { builderPath: "./builder" },
    } as Extract<PrinterOptions, { dsl: DSL }>,
  };

  if (!input) return params;

  const boolParam = (name: string, v: string | undefined): boolean => {
    if (!v || v === "true") return true;
    if (v === "false") return false;
    throw new Error(`${name} should be bool, got string: ${v}`);
  };
  const stringParam = (name: string, v: string | undefined): string => {
    if (!v) throw new Error(`${name} should be string`);
    return v;
  };

  function checkEnum<T extends string>(
    v: string,
    whitelist: readonly T[],
  ): v is T {
    return whitelist.includes(v as any);
  }

  for (const kv of input.split(",")) {
    const idx = kv.indexOf("=");
    const [k, v] =
      idx === -1 ? [kv, ""] : [kv.slice(0, idx), kv.slice(idx + 1)];
    switch (k) {
      case "use_protobufjs": {
        if (boolParam(k, v)) params.printer.protobuf = "protobufjs";
        break;
      }
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
      case "file_layout": {
        const s = stringParam(k, v);
        if (!checkEnum(s, fileLayouts)) {
          throw new Error(
            `file_layout should be ${fileLayouts
              .map((s) => `"${s}"`)
              .join(", ")}`,
          );
        }
        params.printer.fileLayout = s;
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
      case "target":
        // used by @bufbuild/protoplugin
        // no-op
        break;
      default:
        throw new Error(`unknown param: ${kv}`);
    }
  }

  if (params.printer.protobuf !== "protobuf-es") {
    params.type.scalarMapping = {
      ...defaultScalarMappingForTsProto,
      ...params.type.scalarMapping,
    };
  }

  return params;
}
