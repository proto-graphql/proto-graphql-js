import type { PrinterOptions } from "@proto-graphql/codegen-core";

export type PothosPrinterOptions = Extract<PrinterOptions, { dsl: "pothos" }>;
