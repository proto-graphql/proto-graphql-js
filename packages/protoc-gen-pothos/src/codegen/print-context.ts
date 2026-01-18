import type { GeneratedFile } from "@bufbuild/protoplugin";
import type { ImportSymbol, Printable } from "./types.js";

export class PrintContext {
  readonly #file: GeneratedFile;

  constructor(file: GeneratedFile) {
    this.#file = file;
  }

  import(name: string, from: string, typeOnly?: boolean): ImportSymbol {
    return this.#file.import(name, from, typeOnly);
  }

  print(...parts: Printable[]): void {
    this.#file.print(...parts);
  }
}
