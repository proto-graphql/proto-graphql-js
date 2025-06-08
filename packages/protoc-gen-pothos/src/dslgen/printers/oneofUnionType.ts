import type { GeneratedFile, Registry } from "@bufbuild/protobuf";
import {
  type OneofUnionType,
  type SquashedOneofUnionType,
  compact,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, literalOf } from "ts-poet";

import {
  type PothosPrinterOptions,
  fieldTypeRef,
  pothosBuilder,
  pothosRef,
} from "./util.js";

/**
 * @example
 * ```ts
 * export cosnt Oneof = builder.unionType("Oneof", {
 *   types: [...],
 *   // ...
 * })
 * ```
 */
export function createOneofUnionTypeCode(
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  const typeOpts = {
    types: type.fields.map((f) => fieldTypeRef(f, opts)),
    description: type.description,
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`
    export const ${pothosRef(type)} =
      ${pothosBuilder(type, opts)}.unionType(${literalOf(
        type.typeName,
      )}, ${literalOf(compact(typeOpts))});
  `;
}

/**
 * Prints oneof union type definition using protoplugin's GeneratedFile API
 */
export function printOneofUnionType(
  f: GeneratedFile,
  type: OneofUnionType | SquashedOneofUnionType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  // Generate type refs for union members
  const typeRefs = type.fields.map((field) => {
    const typeRefCode = fieldTypeRef(field, opts);
    return handleFieldTypeRef(f, typeRefCode, opts);
  });
  
  const typeOpts = compact({
    types: typeRefs,
    description: type.description,
    extensions: protobufGraphQLExtensions(type, registry),
  });
  
  // Generate the union type
  f.print(`export const ${pothosRef(type)} =`);
  f.print(`  ${pothosBuilder(type, opts)}.unionType(${JSON.stringify(type.typeName)}, {`);
  
  // Print types array
  if (typeRefs.length > 0) {
    f.print(`    types: [${typeRefs.join(", ")}],`);
  }
  
  // Print description if exists
  if (typeOpts.description) {
    f.print(`    description: ${JSON.stringify(typeOpts.description)},`);
  }
  
  // Print extensions if exists
  if (typeOpts.extensions) {
    f.print(`    extensions: ${JSON.stringify(typeOpts.extensions)},`);
  }
  
  f.print(`  });`);
}

/**
 * Helper function to handle field type refs and imports
 */
function handleFieldTypeRef(
  f: GeneratedFile,
  typeRefCode: Code,
  opts: PothosPrinterOptions,
): string {
  // Convert ts-poet Code to string and handle imports
  const codeStr = typeRefCode.toString();
  
  // For now, return the string representation
  // In a complete implementation, we would parse and register imports
  return codeStr;
}
