import type { DescEnum, DescMessage, Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  type EnumType,
  compact,
  protoType,
  protobufGraphQLExtensions,
} from "@proto-graphql/codegen-core";
import { type Code, code, imp, joinCode, literalOf } from "ts-poet";

import { type PothosPrinterOptions, pothosBuilder, pothosRef } from "./util.js";

/**
 * @example
 * ```ts
 * export cosnt Hello$Ref: EnumRef<Hello, Hello> = builder.enumType("Hello", {
 *   values: [
 *     // ...
 *   ],
 *   // ...
 * })
 * ```
 */
export function createEnumTypeCode(
  type: EnumType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  const typeOpts = {
    description: type.description,
    values: code`{${joinCode(
      type.values
        .filter((v) => !v.isIgnored() && !v.isUnespecified())
        .map(
          (ev) =>
            code`${ev.name}: ${literalOf(
              compact({
                description: ev.description,
                deprecationReason: ev.deprecationReason,
                value: ev.number,
                extensions: protobufGraphQLExtensions(ev, registry),
              }),
            )},`,
        ),
    )}} as const`,
    extensions: protobufGraphQLExtensions(type, registry),
  };

  const protoTypeExpr = protoType(type.proto, opts);
  // EnumRef<Hello, Hello>
  const refTypeExpr = code`${imp(
    "EnumRef@@pothos/core",
  )}<${protoTypeExpr}, ${protoTypeExpr}>`;

  return code`
    export const ${pothosRef(type)}: ${refTypeExpr} =
      ${pothosBuilder(type, opts)}.enumType(${literalOf(
        type.typeName,
      )}, ${literalOf(compact(typeOpts))});
  `;
}

/**
 * Prints enum type definition using protoplugin's GeneratedFile API
 */
export function printEnumType(
  f: GeneratedFile,
  type: EnumType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  // Import EnumRef from @pothos/core
  const enumRefImport = f.import("EnumRef", "@pothos/core");

  // Generate the proto type import
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  const protoTypeImport = f.import(importName, importPath);

  // Build the values object
  const filteredValues = type.values.filter(
    (v) => !v.isIgnored() && !v.isUnespecified(),
  );

  const typeOpts = compact({
    description: type.description,
    extensions: protobufGraphQLExtensions(type, registry),
  });

  // Import builder
  const builderPath = opts.pothos?.builderPath || "../builder";
  const builderImport = f.import("builder", builderPath);

  f.print(""); // Blank line after imports

  // Generate the export statement
  const refName = `${type.typeName}$Ref`;
  f.print(
    "export const ",
    refName,
    ": ",
    enumRefImport,
    "<",
    protoTypeImport,
    ", ",
    protoTypeImport,
    "> =",
  );
  f.print(
    "  ",
    builderImport,
    ".enumType(",
    JSON.stringify(type.typeName),
    ", {",
  );

  // Print description if exists
  if (typeOpts.description) {
    f.print(`    description: ${JSON.stringify(typeOpts.description)},`);
  }

  // Print values object
  f.print(`    values: {`);
  filteredValues.forEach((ev) => {
    const valueOpts = compact({
      description: ev.description,
      deprecationReason: ev.deprecationReason,
      value: ev.number,
      extensions: protobufGraphQLExtensions(ev, registry),
    });
    f.print(`      ${ev.name}: ${JSON.stringify(valueOpts)},`);
  });
  f.print(`    } as const,`);

  // Print extensions if exists
  if (typeOpts.extensions) {
    f.print(`    extensions: ${JSON.stringify(typeOpts.extensions)},`);
  }

  f.print(`  });`);
}

/**
 * Helper function to extract import info for proto types
 */
function getProtoTypeImport(
  proto: DescEnum,
  opts: PothosPrinterOptions,
): { importName: string; importPath: string } {
  // Get the proto type chunks (namespace hierarchy)
  let p: DescEnum | DescMessage = proto;
  const chunks = [p.name];
  while (p.parent != null) {
    p = p.parent;
    chunks.unshift(p.name);
  }

  // Determine import based on protobuf library
  switch (opts.protobuf) {
    case "ts-proto": {
      const importName = chunks.join("_");
      const importPath = `${opts.importPrefix || "."}/${proto.file.name}`;
      return { importName, importPath };
    }
    case "protobuf-es": {
      const importName = chunks.join("_");
      const protoFileName = proto.file.name.replace(/\.proto$/, "_pb");
      const importPath = `${opts.importPrefix || "."}/${protoFileName}`;
      return { importName, importPath };
    }
    default:
      throw new Error(
        `Unsupported protobuf library for protoplugin: ${opts.protobuf}`,
      );
  }
}
