import type { GeneratedFile, Printable } from "@bufbuild/protoplugin";

export function printNonNullResolverStmts(
  g: GeneratedFile,
  valueExpr: Printable,
) {
  return g.print("return ", valueExpr, "!");
}
