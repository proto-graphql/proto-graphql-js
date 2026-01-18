import { formatCode } from "../../../codegen/stringify.js";
import type { Printable } from "../../../codegen/types.js";
import { isImportSymbol } from "../../../codegen/types.js";

/**
 * Printable 配列を文字列に変換（テスト用）
 * ImportSymbol は名前のみ出力し、インポート文は生成しない
 */
export function printablesToString(printables: Printable[]): string {
  const parts: string[] = [];

  function visit(p: Printable) {
    if (typeof p === "string") {
      parts.push(p);
    } else if (typeof p === "number" || typeof p === "boolean") {
      parts.push(String(p));
    } else if (isImportSymbol(p)) {
      parts.push(p.name);
    } else if (Array.isArray(p)) {
      for (const item of p) {
        visit(item);
      }
    }
  }

  for (const p of printables) {
    visit(p);
  }

  const code = parts.join("");
  return code ? formatCode(code) : "";
}

/**
 * Printable 配列を文字列に変換し、インポート文も含める（テスト用）
 * stringifyWithImports の代替
 */
export function printablesToStringWithImports(printables: Printable[]): string {
  if (printables.length === 0) {
    return "";
  }

  // インポートを収集
  const imports = new Map<string, Set<string>>();

  function collectImports(p: Printable) {
    if (isImportSymbol(p)) {
      const symbols = imports.get(p.from) ?? new Set();
      symbols.add(p.name);
      imports.set(p.from, symbols);
    } else if (Array.isArray(p)) {
      for (const item of p) {
        collectImports(item);
      }
    }
  }

  for (const p of printables) {
    collectImports(p);
  }

  // インポート文を生成（元の順序を維持）
  const importLines: string[] = [];
  const sortedEntries = [...imports.entries()].sort(([a], [b]) => {
    const aIsRelative = a.startsWith("./") || a.startsWith("../");
    const bIsRelative = b.startsWith("./") || b.startsWith("../");
    if (aIsRelative !== bIsRelative) return aIsRelative ? 1 : -1;
    return a.localeCompare(b);
  });

  for (const [path, symbols] of sortedEntries) {
    const sortedSymbols = [...symbols].sort();
    importLines.push(`import { ${sortedSymbols.join(", ")} } from "${path}";`);
  }

  // 本文を生成
  const body = printablesToString(printables);

  const parts: string[] = [];
  if (importLines.length > 0) {
    parts.push(importLines.join("\n"));
    parts.push("\n\n");
  }
  parts.push(body);

  let result = parts.join("");
  if (!result.endsWith("\n")) {
    result += "\n";
  }

  return formatCode(result);
}
