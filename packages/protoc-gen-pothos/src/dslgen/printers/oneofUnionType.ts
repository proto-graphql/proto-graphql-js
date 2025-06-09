import type { Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  type OneofUnionType,
  type SquashedOneofUnionType,
  compact,
  generatedGraphQLTypeImportPath,
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
  // Import builder
  const builderPath = opts.pothos?.builderPath || "../builder";
  const builderImport = f.import("builder", builderPath);

  // Get ref name
  const refName = `${type.typeName}$Ref`;

  // Collect type refs and handle imports
  const typeRefSymbols: any[] = [];
  for (const field of type.fields) {
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    const fieldRefName = `${field.type.typeName}$Ref`;

    if (importPath) {
      const importSym = f.import(fieldRefName, importPath);
      typeRefSymbols.push(importSym);
    } else {
      typeRefSymbols.push(fieldRefName);
    }
  }

  // Get extensions
  const extensions = protobufGraphQLExtensions(type, registry);

  // Print the union type
  f.print(
    "export const ",
    refName,
    " = ",
    builderImport,
    ".unionType(",
    JSON.stringify(type.typeName),
    ", {",
  );

  // Print types array
  if (typeRefSymbols.length > 0) {
    f.print(
      "  types: [",
      ...typeRefSymbols.flatMap((ref, i) => (i === 0 ? [ref] : [", ", ref])),
      "],",
    );
  }

  // Print description if exists
  if (type.description) {
    f.print(`  description: ${JSON.stringify(type.description)},`);
  }

  // Print extensions if exists
  if (extensions) {
    f.print(`  extensions: ${JSON.stringify(extensions)},`);
  }

  f.print("});");
}
