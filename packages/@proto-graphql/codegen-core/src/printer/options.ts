export const fileLayouts = ["proto_file", "graphql_type"] as const;
type FileLayout = (typeof fileLayouts)[number];

type PrinterDSLOptions =
  | { dsl: "nexus" }
  | {
      dsl: "pothos";
      pothos: { builderPath: string };
    };

export const protobufLibs = [
  "google-protobuf",
  "protobufjs",
  "ts-proto",
  "protobuf-es",
] as const;

type PrinterProtobufOptions =
  | { protobuf: "google-protobuf" }
  | { protobuf: "protobufjs" }
  | { protobuf: "ts-proto" }
  | { protobuf: "protobuf-es" };

export interface PrinterCommonOptions {
  emitImportedFiles: boolean;
  importPrefix: string | null;
  fileLayout: FileLayout;
  filenameSuffix: string;
}

export type PrinterOptions = PrinterCommonOptions &
  PrinterDSLOptions &
  PrinterProtobufOptions;
