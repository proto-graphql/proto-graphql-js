import type { DescEnum, DescField, DescMessage, GeneratedFile, Registry } from "@bufbuild/protobuf";
import * as path from "node:path";
import {
  InterfaceType,
  ObjectType,
  ObjectField,
  ObjectOneofField,
  EnumType,
  ScalarType,
  SquashedOneofUnionType,
  OneofUnionType,
  compact,
  protoType,
  protobufGraphQLExtensions,
  tsFieldName,
  createGetFieldValueCode,
  filename,
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
  
  // First get import paths but don't import yet
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  
  // Calculate builder path
  const builderPath = opts.pothos?.builderPath || "../builder";
  
  // Calculate the actual file path for this type based on fileLayout
  const typeFilePath = filename(type, opts);
  const typeFileDir = path.dirname(typeFilePath);
  
  // Calculate relative path from the generated file to the builder
  let normalizedBuilderPath: string;
  if (builderPath.startsWith(".")) {
    // If builder path is relative, calculate from the generated file location
    normalizedBuilderPath = path.relative(typeFileDir, builderPath);
    if (!normalizedBuilderPath.startsWith(".")) {
      normalizedBuilderPath = `./${normalizedBuilderPath}`;
    }
  } else {
    // If builder path is absolute (module path), use as-is
    normalizedBuilderPath = builderPath;
  }
  
  // Now import in correct order: proto type first, then builder
  const builderImport = f.import("builder", normalizedBuilderPath);
  const protoTypeImport = f.import(importName, importPath);
  
  // Get the ref name
  const refName = `${type.typeName}$Ref`;
  
  f.print("");  // Blank line after imports
  
  // Generate the ref declaration
  if (isInterface) {
    // For interfaces, we need a Pick type with the fields
    const fieldNames = type.fields
      .map((f) => `"${tsFieldName(f.proto as DescField, opts)}"`)
      .join(" | ");
    
    f.print("export const ", refName, " = ", builderImport, ".interfaceRef<");
    f.print("  Pick<", protoTypeImport, ", ", fieldNames, ">");
    f.print(">(", JSON.stringify(type.typeName), ");");
  } else {
    f.print("export const ", refName, " = ", builderImport, ".objectRef<", protoTypeImport, ">(", JSON.stringify(type.typeName), ");");
  }
  
  // Generate the type definition
  const buildTypeFunc = isInterface ? "interfaceType" : "objectType";
  f.print(builderImport, ".", buildTypeFunc, "(", refName, ", {");
  f.print(`  name: ${JSON.stringify(type.typeName)},`);
  
  // Print description if exists
  if (type.description) {
    f.print(`  description: ${JSON.stringify(type.description)},`);
  }
  
  // Print fields
  f.print(`  fields: t => ({`);
  
  if (type.fields.length > 0) {
    type.fields.forEach((field) => {
      printFieldDefinition(f, field, type, registry, opts);
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
      f.print("    return (source as ", protoTypeImport, " | { $type: string & {} }).$type");
      f.print(`      === ${JSON.stringify(type.proto.typeName)};`);
      f.print(`  },`);
      break;
    }
    case "protobuf-es": {
      f.print(`  isTypeOf: (source) => {`);
      f.print("    return source instanceof ", protoTypeImport, ";");
      f.print(`  },`);
      break;
    }
    default:
      throw new Error(`Unsupported protobuf lib for protoplugin: ${opts.protobuf}`);
  }
}

/**
 * Helper function to print field definition
 */
function printFieldDefinition(
  f: GeneratedFile,
  field: ObjectField<any> | ObjectOneofField,
  parentType: ObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const extensions = protobufGraphQLExtensions(field, registry);
  
  // Determine field type string and whether it's a reference
  let fieldTypeStr: string;
  let isRef = false;
  
  if (field.type instanceof ScalarType) {
    // Map scalar types to GraphQL types
    switch (field.type.typeName) {
      case "Int64":
        // For ts-proto, Int64 fields are strings
        fieldTypeStr = opts.protobuf === "ts-proto" ? "String" : "Int64";
        break;
      case "Byte":
        fieldTypeStr = "Byte";
        break;
      default:
        fieldTypeStr = field.type.typeName;
    }
  } else if (field.type instanceof ObjectType || 
             field.type instanceof EnumType || 
             field.type instanceof SquashedOneofUnionType ||
             field.type instanceof OneofUnionType) {
    // For object/enum/union types, we need to generate the ref import
    // Import the generated GraphQL file for this type
    const importPath = getGeneratedGraphQLTypeImportPath(field, parentType, opts);
    if (importPath) {
      const refName = `${field.type.typeName}$Ref`;
      fieldTypeStr = f.import(refName, importPath);
    } else {
      // Same file, just use the ref name directly
      fieldTypeStr = `${field.type.typeName}$Ref`;
    }
    isRef = true;
  } else {
    fieldTypeStr = "String"; // fallback
  }
  
  // Determine if we should use t.expose or t.field
  const needsResolver = field instanceof ObjectOneofField ||
                        field.type instanceof EnumType ||
                        field.type instanceof SquashedOneofUnionType ||
                        field.type instanceof OneofUnionType ||
                        (field.type instanceof ScalarType && field.type.isBytes()) ||
                        (!field.isNullable() && field.type instanceof ObjectType);
  
  const shouldUseExpose = field instanceof ObjectField && !needsResolver;
  
  const fieldName = field.name;
  const protoFieldName = tsFieldName(field.proto as DescField, opts);
  
  if (shouldUseExpose) {
    f.print(`    ${fieldName}: t.expose("${protoFieldName}", {`);
    
    // Print type - handle arrays and refs
    if (field.isList()) {
      if (isRef) {
        f.print("      type: [", fieldTypeStr, "],");
      } else {
        f.print(`      type: ["${fieldTypeStr}"],`);
      }
    } else {
      if (isRef) {
        f.print("      type: ", fieldTypeStr, ",");
      } else {
        f.print(`      type: "${fieldTypeStr}",`);
      }
    }
    
    // Handle nullable
    if (field.isList()) {
      f.print(`      nullable: { list: ${field.isNullable()}, items: false },`);
    } else {
      f.print(`      nullable: ${field.isNullable()},`);
    }
  } else {
    f.print(`    ${fieldName}: t.field({`);
    
    // Print type - handle arrays and refs
    if (field.isList()) {
      if (isRef) {
        f.print("      type: [", fieldTypeStr, "],");
      } else {
        f.print(`      type: ["${fieldTypeStr}"],`);
      }
    } else {
      if (isRef) {
        f.print("      type: ", fieldTypeStr, ",");
      } else {
        f.print(`      type: "${fieldTypeStr}",`);
      }
    }
    
    // Handle nullable
    if (field.isList()) {
      f.print(`      nullable: { list: ${field.isNullable()}, items: false },`);
    } else {
      f.print(`      nullable: ${field.isNullable()},`);
    }
    
    // Add resolver
    f.print(`      resolve: (source) => {`);
    
    if (field instanceof ObjectOneofField) {
      // Handle oneof fields
      if (opts.protobuf === "protobuf-es") {
        // For protobuf-es, oneof values are accessed via .value property
        const oneofFieldName = tsFieldName(field.proto, opts);
        f.print(`        const value = source.${oneofFieldName}.value;`);
        if (field.isNullable()) {
          f.print(`        if (value == null) {`);
          f.print(`          return null;`);
          f.print(`        }`);
          f.print(`        return value;`);
        } else {
          f.print(`        if (value == null) {`);
          f.print(`          throw new Error("${fieldName} should not be null");`);
          f.print(`        }`);
          f.print(`        return value;`);
        }
      } else {
        // For ts-proto, access oneof fields directly
        const oneofMembers = field.type.fields
          .map(f => tsFieldName(f.proto, opts));
        
        if (field.isNullable()) {
          f.print(`        const value = ${oneofMembers.map(m => `source.${m}`).join(' ?? ')};`);
          f.print(`        if (value == null) {`);
          f.print(`          return null;`);
          f.print(`        }`);
          f.print(`        return value;`);
        } else {
          f.print(`        const value = ${oneofMembers.map(m => `source.${m}`).join(' ?? ')};`);
          f.print(`        if (value == null) {`);
          f.print(`          throw new Error("${fieldName} should not be null");`);
          f.print(`        }`);
          f.print(`        return value;`);
        }
      }
    } else if (field.type instanceof EnumType) {
      // Handle enum fields
      const enumProto = field.type.proto;
      const { importName: enumImportName, importPath: enumImportPath } = getProtoTypeImport(enumProto, opts);
      const enumImport = f.import(enumImportName, enumImportPath);
      
      const unspecifiedValueName = opts.protobuf === "protobuf-es" 
        ? enumProto.values[0].localName 
        : enumProto.values[0].name;
      
      if (field.isList()) {
        // List of enums - need to handle each item
        const ignoredValues = field.type.valuesWithIgnored.filter(v => v.isIgnored());
        if (field.type.unspecifiedValue || ignoredValues.length > 0) {
          f.print(`        return source.${protoFieldName}.map(item => {`);
          
          if (field.type.unspecifiedValue) {
            f.print("          if (item === ", enumImport, ".", unspecifiedValueName, ") {");
            f.print(`            throw new Error("${field.name} is required field. But got unspecified.");`);
            f.print(`          }`);
          }
          
          for (const ignoredValue of ignoredValues) {
            const ignoredValueName = opts.protobuf === "protobuf-es"
              ? ignoredValue.proto.localName
              : ignoredValue.proto.name;
            f.print("          if (item === ", enumImport, ".", ignoredValueName, ") {");
            f.print(`            throw new Error("${ignoredValue.name} is ignored in GraphQL schema");`);
            f.print(`          }`);
          }
          
          f.print(`          return item;`);
          f.print(`        });`);
        } else {
          f.print(`        return source.${protoFieldName};`);
        }
      } else {
        if (field.type.unspecifiedValue) {
          f.print("        if (source.", protoFieldName, " === ", enumImport, ".", unspecifiedValueName, ") {");
          if (field.isNullable()) {
            f.print(`          return null;`);
          } else {
            f.print(`          throw new Error("${field.name} is required field. But got unspecified.");`);
          }
          f.print(`        }`);
        }
        
        // Check for ignored enum values
        const ignoredValues = field.type.valuesWithIgnored.filter(v => v.isIgnored());
        for (const ignoredValue of ignoredValues) {
          const ignoredValueName = opts.protobuf === "protobuf-es"
            ? ignoredValue.proto.localName
            : ignoredValue.proto.name;
          f.print("        if (source.", protoFieldName, " === ", enumImport, ".", ignoredValueName, ") {");
          f.print(`          throw new Error("${ignoredValue.name} is ignored in GraphQL schema");`);
          f.print(`        }`);
        }
        
        f.print(`        return source.${protoFieldName};`);
      }
    } else if (field.type instanceof ScalarType && field.type.isBytes()) {
      // Handle bytes fields
      if (field.isList()) {
        f.print(`        return source.${protoFieldName}.map(v => Buffer.from(v));`);
      } else {
        if (field.isNullable()) {
          f.print(`        return source.${protoFieldName} == null ? null : Buffer.from(source.${protoFieldName});`);
        } else {
          f.print(`        return Buffer.from(source.${protoFieldName});`);
        }
      }
    } else if (field.type instanceof SquashedOneofUnionType) {
      // Handle squashed oneof union
      if (opts.protobuf === "protobuf-es") {
        // For protobuf-es, squashed oneof values are accessed via the oneof name
        const oneofName = tsFieldName(field.type.oneofUnionType.proto, opts);
        
        if (field.isList()) {
          f.print(`        return source.${protoFieldName}.map(item => {`);
          f.print(`          const value = item.${oneofName}.value;`);
          if (!field.isNullable()) {
            f.print(`          if (value == null) {`);
            f.print(`            throw new Error("${fieldName} should not be null");`);
            f.print(`          }`);
          }
          f.print(`          return value;`);
          f.print(`        });`);
        } else {
          f.print(`        const value = source.${oneofName}.value;`);
          if (field.isNullable()) {
            f.print(`        if (value == null) {`);
            f.print(`          return null;`);
            f.print(`        }`);
          } else {
            f.print(`        if (value == null) {`);
            f.print(`          throw new Error("${fieldName} should not be null");`);
            f.print(`        }`);
          }
          f.print(`        return value;`);
        }
      } else {
        // For ts-proto, access fields directly
        const oneofMembers = field.type.fields
          .map(f => tsFieldName(f.proto, opts));
        
        if (field.isList()) {
          f.print(`        return source.${protoFieldName}.map(item => {`);
          f.print(`          const value = ${oneofMembers.map(m => `item?.${m}`).join(' ?? ')};`);
          if (!field.isNullable()) {
            f.print(`          if (value == null) {`);
            f.print(`            throw new Error("${fieldName} should not be null");`);
            f.print(`          }`);
          }
          f.print(`          return value;`);
          f.print(`        });`);
        } else {
          f.print(`        const value = ${oneofMembers.map(m => `source.${m}`).join(' ?? ')};`);
          if (field.isNullable()) {
            f.print(`        if (value == null) {`);
            f.print(`          return null;`);
            f.print(`        }`);
          } else {
            f.print(`        if (value == null) {`);
            f.print(`          throw new Error("${fieldName} should not be null");`);
            f.print(`        }`);
          }
          f.print(`        return value;`);
        }
      }
    } else if (!field.isNullable() && field.type instanceof ObjectType) {
      // Handle required object fields
      f.print(`        return source.${protoFieldName}!;`);
    } else {
      // Default case
      f.print(`        return source.${protoFieldName};`);
    }
    
    f.print(`      },`);
  }
  
  // Add description
  if (field.description) {
    f.print(`      description: ${JSON.stringify(field.description)},`);
  }
  
  // Add deprecation reason
  if (field.deprecationReason) {
    f.print(`      deprecationReason: ${JSON.stringify(field.deprecationReason)},`);
  }
  
  // Add extensions
  if (extensions) {
    f.print(`      extensions: ${JSON.stringify(extensions)},`);
  }
  
  f.print(`    }),`);
}

/**
 * Helper function to get enum import name
 */
function getEnumImportName(enumProto: DescEnum, opts: PothosPrinterOptions): string {
  let p: DescEnum | DescMessage = enumProto;
  const chunks = [p.name];
  while (p.parent != null) {
    p = p.parent;
    chunks.unshift(p.name);
  }
  
  switch (opts.protobuf) {
    case "ts-proto":
      // For ts-proto, nested enums use underscore separation
      return chunks.join("_");
    case "protobuf-es":
      // For protobuf-es, it's just the enum name
      return chunks.join("_");
    default:
      return chunks.join("_");
  }
}

/**
 * Helper function to extract import info for proto types
 */
function getProtoTypeImport(
  proto: DescMessage | DescEnum,
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
      const importPath = `${opts.importPrefix || "."}/${proto.file.name}`;
      return { importName, importPath };
    }
    default:
      throw new Error(`Unsupported protobuf library for protoplugin: ${opts.protobuf}`);
  }
}

/**
 * Helper function to get import path for generated GraphQL types
 */
function getGeneratedGraphQLTypeImportPath(
  field: ObjectField<any> | ObjectOneofField,
  parentType: ObjectType,
  opts: PothosPrinterOptions,
): string | null {
  // For ObjectOneofField, the proto is a DescOneof which has a parent message
  const fieldProto = field instanceof ObjectOneofField 
    ? field.proto.parent 
    : field.type.proto;
    
  // Check if the field type is from the same file as the parent type
  if (fieldProto.file === parentType.proto.file) {
    return null; // Same file, no import needed
  }
  
  // Calculate the relative import path
  const fieldTypeFile = fieldProto.file.name;
  const parentTypeFile = parentType.proto.file.name;
  
  // Use the fileLayout to determine where the generated files are
  const suffix = opts.filenameSuffix || "";
  
  // For now, assume both files are in the same directory structure
  // This is a simplified implementation - you may need to adjust based on your actual file layout
  const fieldTypePath = fieldTypeFile.replace(/\.proto$/, suffix);
  const parentTypePath = parentTypeFile.replace(/\.proto$/, suffix);
  
  // Calculate relative path from parent to field type
  const parentDir = parentTypePath.substring(0, parentTypePath.lastIndexOf('/'));
  const fieldTypeRelative = fieldTypePath.substring(0, fieldTypePath.lastIndexOf('/'));
  
  if (parentDir === fieldTypeRelative) {
    // Same directory
    return `./${fieldTypePath.substring(fieldTypePath.lastIndexOf('/') + 1)}`;
  }
  
  // For more complex paths, you'd need a proper relative path calculation
  // For now, use a simple approach
  return `./${fieldTypePath}`;
}
