import type { DescEnum, DescField, DescMessage, GeneratedFile, Registry } from "@bufbuild/protobuf";
import {
  InterfaceType,
  type ObjectType,
  compact,
  protoType,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import { type Code, code, joinCode, literalOf } from "ts-poet";

import { createFieldRefCode, createNoopFieldRefCode } from "./field.js";
import { type PothosPrinterOptions, pothosBuilder, pothosRef } from "./util.js";

/**
 * @example
 * ```ts
 * export const Hello$Ref = builder.objectRef<_$hello$hello_pb.Hello>("Hello")
 * builder.objectType(Hello$Ref, {
 *   name: "Hello",
 *   // ...
 * })
 * ```
 */
export function createObjectTypeCode(
  type: ObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  const isInterface = type instanceof InterfaceType;
  const typeOpts = {
    name: type.typeName,
    fields: code`t => ({${
      type.fields.length > 0
        ? joinCode(
            type.fields.map(
              (f) => code`${f.name}: ${createFieldRefCode(f, registry, opts)},`,
            ),
          )
        : code`_: ${createNoopFieldRefCode({ input: false })}`
    }})`,
    description: type.description,
    isTypeOf: isInterface
      ? undefined
      : createIsTypeOfFuncCode(type, registry, opts),
    extensions: protobufGraphQLExtensions(type, registry),
  };
  const buildRefFunc = code`${pothosBuilder(type, opts)}.${
    isInterface ? "interface" : "object"
  }Ref`;
  const buildTypeFunc = code`${pothosBuilder(type, opts)}.${
    isInterface ? "interface" : "object"
  }Type`;
  const refFuncTypeArg = isInterface
    ? code`
        Pick<
          ${protoType(type.proto, opts)},
          ${joinCode(
            type.fields.map(
              (f) =>
                code`${literalOf(tsFieldName(f.proto as DescField, opts))}`,
            ),
            { on: "|" },
          )}
        >`
    : protoType(type.proto, opts);

  return code`
    export const ${pothosRef(
      type,
    )} = ${buildRefFunc}<${refFuncTypeArg}>(${literalOf(type.typeName)});
    ${buildTypeFunc}(${pothosRef(type)}, ${literalOf(compact(typeOpts))});
  `;
}

function createIsTypeOfFuncCode(
  type: ObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  switch (opts.protobuf) {
    case "ts-proto": {
      return code`
        (source) => {
          return (source as ${protoType(type.proto, opts)} | { $type: string & {} }).$type
            === ${literalOf(type.proto.typeName)};
        }
      `;
    }
    case "protobuf-es": {
      return code`
        (source) => {
          return source instanceof ${protoType(type.proto, opts)}
        }
      `;
    }
    case "google-protobuf":
    case "protobufjs": {
      throw new Error(`Unsupported protobuf lib: ${opts.protobuf}`);
    }
    default: {
      opts satisfies never;
      throw "unreachable";
    }
  }
}

/**
 * Prints object type definition using protoplugin's GeneratedFile API
 */
export function printObjectType(
  f: GeneratedFile,
  type: ObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const isInterface = type instanceof InterfaceType;
  
  // Generate proto type import
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  const protoTypeImport = f.import(importName, importPath);
  
  // Import builder
  const builderPath = opts.pothos?.builderPath || "../builder";
  const normalizedBuilderPath = builderPath.startsWith("../") || builderPath.startsWith("./") 
    ? builderPath 
    : `./${builderPath}`;
  const builderImport = f.import("builder", normalizedBuilderPath);
  
  // Get the ref name
  const refName = `${type.typeName}$Ref`;
  
  // Generate the ref declaration
  if (isInterface) {
    // For interfaces, we need a Pick type with the fields
    const fieldNames = type.fields
      .map((f) => `"${tsFieldName(f.proto as DescField, opts)}"`)
      .join(" | ");
    
    f.print(`export const ${refName} = ${builderImport}.interfaceRef<`);
    f.print(`  Pick<${protoTypeImport}, ${fieldNames}>`);
    f.print(`>(${JSON.stringify(type.typeName)});`);
  } else {
    f.print(`export const ${refName} = ${builderImport}.objectRef<${protoTypeImport}>(${JSON.stringify(type.typeName)});`);
  }
  
  f.print("");
  
  // Generate the type definition
  const buildTypeFunc = isInterface ? "interfaceType" : "objectType";
  f.print(`${builderImport}.${buildTypeFunc}(${refName}, {`);
  f.print(`  name: ${JSON.stringify(type.typeName)},`);
  
  // Print description if exists
  if (type.description) {
    f.print(`  description: ${JSON.stringify(type.description)},`);
  }
  
  // Print fields
  f.print(`  fields: t => ({`);
  
  if (type.fields.length > 0) {
    // We need to print field definitions
    // For now, just print a placeholder comment
    type.fields.forEach((field) => {
      f.print(`    // TODO: Convert field ${field.name} definition`);
      f.print(`    ${field.name}: t.field({ type: "String", resolve: () => "TODO" }),`);
    });
  } else {
    f.print(`    _: t.field({ type: "Boolean", nullable: true, description: "noop field", resolve: () => true }),`);
  }
  
  f.print(`  }),`);
  
  // Print isTypeOf for non-interface types
  if (!isInterface) {
    printIsTypeOfFunc(f, type, protoTypeImport, opts);
  }
  
  // Print extensions if exists
  const extensions = protobufGraphQLExtensions(type, registry);
  if (extensions) {
    f.print(`  extensions: ${JSON.stringify(extensions)},`);
  }
  
  f.print(`});`);
}

/**
 * Helper function to print isTypeOf function
 */
function printIsTypeOfFunc(
  f: GeneratedFile,
  type: ObjectType,
  protoTypeImport: string,
  opts: PothosPrinterOptions,
): void {
  switch (opts.protobuf) {
    case "ts-proto": {
      f.print(`  isTypeOf: (source) => {`);
      f.print(`    return (source as ${protoTypeImport} | { $type: string & {} }).$type`);
      f.print(`      === ${JSON.stringify(type.proto.typeName)};`);
      f.print(`  },`);
      break;
    }
    case "protobuf-es": {
      f.print(`  isTypeOf: (source) => {`);
      f.print(`    return source instanceof ${protoTypeImport};`);
      f.print(`  },`);
      break;
    }
    default:
      throw new Error(`Unsupported protobuf lib for protoplugin: ${opts.protobuf}`);
  }
}

/**
 * Helper function to extract import info for proto types
 */
function getProtoTypeImport(
  proto: DescMessage,
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
    case "ts-proto":
    case "protobuf-es": {
      const importName = chunks.join("_");
      const importPath = `${opts.importPrefix || "./"}/${proto.file.name}`;
      return { importName, importPath };
    }
    default:
      throw new Error(`Unsupported protobuf library for protoplugin: ${opts.protobuf}`);
  }
}
