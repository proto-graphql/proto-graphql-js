import { code, type Code } from "ts-poet";

export function createNonNullResolverCode(valueExpr: Code): Code {
  return code`
    return ${valueExpr}!;
  `;
}
