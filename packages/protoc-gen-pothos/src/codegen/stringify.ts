import dprint from "dprint-node";

export function formatCode(code: string): string {
  return dprint.format("file.ts", code, {
    lineWidth: 80,
    indentWidth: 2,
    useTabs: false,
    semiColons: "always",
    quoteStyle: "alwaysDouble",
    quoteProps: "asNeeded",
    newLineKind: "lf",
    useBraces: "whenNotSingleLine",
    bracePosition: "sameLineUnlessHanging",
    singleBodyPosition: "maintain",
    nextControlFlowPosition: "sameLine",
    trailingCommas: "onlyMultiLine",
    operatorPosition: "nextLine",
    preferHanging: false,
    preferSingleLine: true,
    "arrowFunction.useParentheses": "force",
  });
}
