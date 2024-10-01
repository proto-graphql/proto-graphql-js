import type { Plugin } from "@bufbuild/protoplugin";
import dprint from "dprint-node";

export function withJsFormatter(plugin: Plugin): Plugin {
  return {
    ...plugin,
    run(req) {
      const res = plugin.run(req);
      for (const file of res.file) {
        try {
          file.content = dprint.format(file.name, file.content, {
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
            "arrowFunction.useParentheses": "force",
          });
        } catch (err) {
          console.error(err);
        }
      }
      return res;
    },
  };
}
