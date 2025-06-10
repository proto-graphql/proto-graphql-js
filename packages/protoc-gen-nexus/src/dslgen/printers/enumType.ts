import type { Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  type EnumType,
  compact,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";

/**
 * Prints enum type definition using protoplugin's GeneratedFile API
 * 
 * @example
 * ```ts
 * export const MyEnum = enumType({
 *   name: "MyEnum",
 *   members: [
 *     { name: "FOO", value: 1 },
 *     { name: "BAR", value: 2, description: "This is Bar." },
 *     { name: "BAZ", value: 3 },
 *   ],
 *   extensions: {
 *     protobufEnum: {
 *       name: "MyEnum",
 *       fullName: "testapi.enums.MyEnum",
 *       package: "testapi.enums"
 *     }
 *   }
 * });
 * ```
 */
export function printEnumType(
  f: GeneratedFile,
  type: EnumType,
  registry: Registry,
): void {
  // Import enumType from nexus
  const enumTypeImport = f.import("enumType", "nexus");

  const typeOpts = {
    name: type.typeName,
    description: type.description,
    members: type.values.map((ev) => ({
      name: ev.name,
      value: ev.number,
      description: ev.description,
      deprecation: ev.deprecationReason,
      extensions: protobufGraphQLExtensions(ev, registry),
    })),
    extensions: protobufGraphQLExtensions(type, registry),
  };

  // Clean up the options
  const cleanedOpts = compact(typeOpts);

  // Format in a single line to match the expected output
  const formattedOpts = JSON.stringify(cleanedOpts);
  
  // Add proper formatting with line breaks where needed for readability
  const prettyOpts = formattedOpts
    .replace(/,\{/g, ', {')
    .replace(/\},\{/g, '}, {')
    .replace(/\[\{/g, '[{')
    .replace(/\}\]/g, '}]');

  f.print("export const ", type.typeName, " = ", enumTypeImport, "(", prettyOpts, ");");
}

// Keep the old function for backward compatibility during migration
import { code } from "ts-poet";

export function createEnumTypeCode(type: EnumType, registry: Registry): any {
  // Create a mock GeneratedFile to capture the output
  const outputs: string[] = [];
  const imports = new Map<string, Set<string>>();
  
  const mockFile = {
    print(...args: any[]) {
      outputs.push(args.map(arg => {
        // Handle import symbols
        if (typeof arg === 'object' && arg !== null && '_import' in arg) {
          return arg._import;
        }
        return String(arg);
      }).join(''));
    },
    import(name: string, from: string) {
      if (!imports.has(from)) {
        imports.set(from, new Set());
      }
      imports.get(from)!.add(name);
      return { _import: name };
    }
  } as any;

  // Generate using the new function
  printEnumType(mockFile, type, registry);

  // Build the final output
  const importLines: string[] = [];
  for (const [from, names] of imports) {
    const nameList = Array.from(names).join(", ");
    importLines.push(`import { ${nameList} } from "${from}";`);
  }

  const fullOutput = [...importLines, "", ...outputs].join("\n");
  
  // Return as ts-poet Code object
  return code`${fullOutput}`;
}