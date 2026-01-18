import type { GeneratedFile } from "@bufbuild/protoplugin";
import type { ImportSymbol, Printable } from "./types.js";

export class PrintContext {
  constructor(_file: GeneratedFile) {
    throw new Error("Not implemented");
  }

  import(_name: string, _from: string): ImportSymbol {
    throw new Error("Not implemented");
  }

  print(..._parts: Printable[]): void {
    throw new Error("Not implemented");
  }
}
