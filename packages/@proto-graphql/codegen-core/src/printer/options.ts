export const fileLayouts = ["proto_file", "graphql_type"] as const;
type FileLayout = (typeof fileLayouts)[number];

type PrinterDSLOptions = {
  dsl: "pothos";
  pothos: { builderPath: string };
};

export const protobufLibs = ["ts-proto", "protobuf-es"] as const;

type PrinterProtobufOptions = {
  protobuf: (typeof protobufLibs)[number];
};

export interface PrinterCommonOptions {
  emitImportedFiles: boolean;
  importPrefix: string | null;
  fileLayout: FileLayout;
  filenameSuffix: string;
}

export type PrinterOptions = PrinterCommonOptions &
  PrinterDSLOptions &
  PrinterProtobufOptions;
