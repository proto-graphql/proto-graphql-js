import {
  fileLayouts,
  LongNumberMapping,
  PrinterOptions,
  TypeOptions,
} from "@proto-graphql/codegen-core";

export function parseParams<DSL extends PrinterOptions["dsl"]>(
  input: string | undefined,
  dsl: DSL
): {
  type: TypeOptions;
  printer: Extract<PrinterOptions, { dsl: DSL }>;
} {
  const params = {
    type: {
      partialInputs: false,
      typeMappings: wktypeMappings({ longNumber: "String" }),
      longNumber: "String",
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

  const toBool = (name: string, v: string | undefined): boolean => {
    if (!v || v === "true") return true;
    if (v === "false") return false;
    throw new Error(`${name} should be bool, got string: ${v}`);
  };
  const toString = (name: string, v: string | undefined): string => {
    if (!v) throw new Error(`${name} should be string`);
    return v;
  };

  function checkEnum<T extends string>(
    v: string,
    whitelist: readonly T[]
  ): v is T {
    return whitelist.includes(v as any);
  }

  for (const kv of input.split(",")) {
    const idx = kv.indexOf("=");
    const [k, v] =
      idx === -1 ? [kv, ""] : [kv.slice(0, idx), kv.slice(idx + 1)];
    switch (k) {
      case "use_protobufjs":
        if (toBool(k, v)) params.printer.protobuf = "protobufjs";
        break;
      case "import_prefix":
        params.printer.importPrefix = toString(k, v);
        break;
      case "partial_inputs":
        params.type.partialInputs = toBool(k, v);
        break;
      case "emit_imported_files":
        params.printer.emitImportedFiles = toBool(k, v);
        break;
      case "file_layout": {
        const s = toString(k, v);
        if (!checkEnum(s, fileLayouts)) {
          throw new Error(
            `file_layout should be ${fileLayouts
              .map((s) => `"${s}"`)
              .join(", ")}`
          );
        }
        params.printer.fileLayout = s;
        break;
      }
      case "custom_type": {
        const idx = v.indexOf("=");
        const [protoType, gqlType] =
          idx === -1 ? [v, ""] : [v.slice(0, idx), v.slice(idx + 1)];
        params.type.typeMappings[protoType] = gqlType;
        break;
      }
      case "pothos_builder_path": {
        (
          params.printer as Extract<PrinterOptions, { dsl: "pothos" }>
        ).pothos.builderPath = toString(k, v);
        break;
      }
      case "long_number": {
        params.type.longNumber = toString(k, v);
        params.type.typeMappings = {
          ...params.type.typeMappings,
          ...wktypeMappings({ longNumber: params.type.longNumber }),
        };
        break;
      }
      case "ignore_non_message_oneof_fields": {
        params.type.ignoreNonMessageOneofFields = true;
        break;
      }
      default:
        throw new Error(`unknown param: ${kv}`);
    }
  }

  return params;
}

function wktypeMappings({ longNumber }: { longNumber: LongNumberMapping }) {
  return {
    "google.protobuf.Int32Value": "Int",
    "google.protobuf.Int64Value": longNumber,
    "google.protobuf.UInt32Value": "Int",
    "google.protobuf.UInt64Value": longNumber,
    "google.protobuf.FloatValue": "Float",
    "google.protobuf.DoubleValue": "Float",
    "google.protobuf.BoolValue": "Boolean",
    "google.protobuf.StringValue": "String",
    "google.protobuf.Timestamp": "DateTime",
  };
}
