import { code, type Printable } from "../../../codegen/index.js";

export function createNonNullResolverCode(valueExpr: Printable[]): Printable[] {
  return code`
    return ${valueExpr}!;
  `;
}
