import type { Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  type OneofUnionType,
  type SquashedOneofUnionType,
  protobufGraphQLExtensions,
  generatedGraphQLTypeImportPath,
} from "@proto-graphql/codegen-core";
import type { NexusPrinterOptions } from "./util.js";

/**
 * Prints oneof union type definition using protoplugin's GeneratedFile API
 * 
 * @example
 * ```ts
 * export const OneofParentRequiredOneofMembers = unionType({
 *   name: "OneofParentRequiredOneofMembers",
 *   description: "Required. disallow not_set.",
 *   definition: (t) => {
 *     t.members(OneofMemberMessage1, OneofMemberMessage2);
 *   },
 *   extensions: {
 *     protobufOneof: {
 *       fullName: "testapis.oneof.OneofParent.required_oneof_members",
 *       name: "required_oneof_members",
 *       messageName: "OneofParent",
 *       package: "testapis.oneof",
 *       fields: [...]
 *     }
 *   }
 * });
 * ```
 */
export function printOneofUnionType(
  f: GeneratedFile,
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: NexusPrinterOptions,
): void {
  // Import unionType from nexus
  const unionTypeImport = f.import("unionType", "nexus");
  
  // Start union type definition
  f.print("export const ", type.typeName, " = ", unionTypeImport, "({");
  
  // Print name
  f.print("  ", JSON.stringify("name"), ": ", JSON.stringify(type.typeName), ",");
  
  // Print description if exists
  if (type.description) {
    f.print("  ", JSON.stringify("description"), ": ", JSON.stringify(type.description), ",");
  }
  
  // Print definition
  f.print("  ", JSON.stringify("definition"), ": (t) => {");
  
  // Collect member type names and handle imports
  const memberNames: string[] = [];
  for (const field of type.fields) {
    const typeName = field.type.typeName;
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    
    if (importPath) {
      // Import from another file
      f.import(typeName, importPath);
    }
    
    memberNames.push(typeName);
  }
  
  // Print members
  if (memberNames.length > 0) {
    f.print("    t.members(", memberNames.join(", "), ");");
  }
  
  f.print("  },");
  
  // Print extensions if exists
  const extensions = protobufGraphQLExtensions(type, registry);
  if (extensions) {
    f.print("  ", JSON.stringify("extensions"), ": ", JSON.stringify(extensions), ",");
  }
  
  f.print("});");
}