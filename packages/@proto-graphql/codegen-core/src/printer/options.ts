type PrinterDSLOptions = {
  dsl: "pothos";
  pothos: { builderPath: string };
};

export const protobufLibs = [
  "ts-proto",
  "protobuf-es-v1",
  "protobuf-es",
] as const;

type PrinterProtobufOptions = {
  protobuf: (typeof protobufLibs)[number];
};

export interface PrinterCommonOptions {
  emitImportedFiles: boolean;
  importPrefix: string | null;
  filenameSuffix: string;
}

export type PrinterOptions = PrinterCommonOptions &
  PrinterDSLOptions &
  PrinterProtobufOptions;
