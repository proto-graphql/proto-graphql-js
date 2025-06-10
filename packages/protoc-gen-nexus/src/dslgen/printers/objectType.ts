import type { Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  InterfaceType,
  type ObjectType,
  compact,
  protoType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode, literalOf } from "ts-poet";

import {
  createFieldDefinitionCode,
  createNoopFieldDefinitionCode,
} from "./field.js";
import { type NexusPrinterOptions, impNexus, nexusTypeDef } from "./util.js";
import { printObjectType } from "./objectType.protoplugin.js";

/**
 * @example
 * ```ts
 * export cosnt Hello = objectType({
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeCode(
  type: ObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): Code {
  // Create a mock GeneratedFile to capture the output
  const outputs: string[] = [];
  const imports = new Map<string, string>();
  const importsByFrom = new Map<string, Set<string>>();
  
  const mockFile = {
    print(...args: any[]) {
      outputs.push(args.map(arg => {
        // Handle import symbols - look for the special __symbolId__ property
        if (typeof arg === 'object' && arg !== null) {
          // Check if this is an ImportSymbol
          const symbolId = (arg as any).__symbolId__;
          if (symbolId && imports.has(symbolId)) {
            return imports.get(symbolId)!;
          }
        }
        return String(arg);
      }).join(''));
    },
    import(name: string, from: string) {
      if (!importsByFrom.has(from)) {
        importsByFrom.set(from, new Set());
      }
      importsByFrom.get(from)!.add(name);
      
      // Create a unique symbol ID
      const symbolId = `${from}::${name}`;
      imports.set(symbolId, name);
      
      // Return an object that mimics ImportSymbol behavior
      return { __symbolId__: symbolId, toString() { return name; } };
    }
  } as any;

  // Generate using the new function
  printObjectType(mockFile, type, registry, opts);

  // Build the final output with imports
  const importLines: string[] = [];
  for (const [from, names] of importsByFrom) {
    const nameList = Array.from(names).join(", ");
    importLines.push(`import { ${nameList} } from "${from}";`);
  }

  const fullOutput = [...importLines, "", ...outputs].join("\n");
  
  // Return as ts-poet Code object
  return code`${fullOutput}`;
}
