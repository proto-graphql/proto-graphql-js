import type { Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  InterfaceType,
  type ObjectType,
  ObjectField,
  ObjectOneofField,
  EnumType,
  ScalarType,
  SquashedOneofUnionType,
  compact,
  protobufGraphQLExtensions,
  tsFieldName,
  isProtobufLong,
  isProtobufWellKnownTypeField,
} from "@proto-graphql/codegen-core";
import { pascalCase, constantCase } from "change-case";
import type { NexusPrinterOptions } from "./util.js";

/**
 * Prints object type definition using protoplugin's GeneratedFile API
 * 
 * @example
 * ```ts
 * export type testapis$primitives$Message = Message1;
 * export const Message = objectType({
 *   name: "Message",
 *   definition: (t) => {
 *     t.field("requiredPrimitives", {
 *       type: nonNull("Primitives"),
 *       resolve: (source) => {
 *         const value = source.getRequiredPrimitives();
 *         if (value == null) {
 *           throw new Error("Cannot return null for non-nullable field");
 *         }
 *         return value;
 *       },
 *     });
 *   },
 *   isTypeOf: (data: unknown) => {
 *     return data instanceof Message1;
 *   },
 *   sourceType: { module: __filename, export: "testapis$primitives$Message" },
 * });
 * ```
 */
export function printObjectType(
  f: GeneratedFile,
  type: ObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): void {
  const isInterface = type instanceof InterfaceType;
  const reExportedPbTypeName = type.proto.typeName.replace(/\./g, "$");
  
  // Import proto type
  const { importName, importPath, alias } = getProtoTypeImport(type.proto, opts);
  const protoTypeImport = alias ? f.import(importName, importPath) : f.import(importName, importPath);
  
  // Import from nexus
  const objectTypeFunc = isInterface ? "interfaceType" : "objectType";
  const objectTypeImport = f.import(objectTypeFunc, "nexus");
  
  // Export type alias
  if (opts.protobuf === "google-protobuf" && alias) {
    f.print("export type ", reExportedPbTypeName, " = ", alias, ";");
  } else if (opts.protobuf === "protobufjs") {
    // For protobufjs, use the full namespace path
    const fullTypeName = type.proto.typeName;
    f.print("export type ", reExportedPbTypeName, " = ", fullTypeName, ";");
  } else {
    f.print("export type ", reExportedPbTypeName, " = ", protoTypeImport, ";");
  }
  
  // Start object type definition
  const typeOpts: any = {
    name: type.typeName,
    description: type.description,
    definition: null, // Will be printed inline
    isTypeOf: null, // Will be printed inline
    sourceType: null, // Will be printed inline
    extensions: protobufGraphQLExtensions(type, registry),
  };
  
  // Clean up options
  const cleanedOpts = compact(typeOpts);
  
  // Start printing
  f.print("export const ", type.typeName, " = ", objectTypeImport, "({");
  
  // Print name
  f.print("  ", JSON.stringify("name"), ": ", JSON.stringify(type.typeName), ",");
  
  // Print description if exists
  if (type.description) {
    f.print("  ", JSON.stringify("description"), ": ", JSON.stringify(type.description), ",");
  }
  
  // Print definition
  f.print("  ", JSON.stringify("definition"), ": (t) => {");
  
  if (type.fields.length > 0) {
    for (const field of type.fields) {
      printFieldDefinition(f, field, registry, opts);
    }
  } else {
    // Noop field
    f.print('    t.field("_", {');
    f.print('      type: "Boolean",');
    f.print('      description: "noop field",');
    f.print('      resolve: () => true,');
    f.print('    });');
  }
  
  f.print("  },");
  
  // Print isTypeOf for non-interface types
  if (!isInterface) {
    f.print("  ", JSON.stringify("isTypeOf"), ": (data: unknown) => {");
    if (opts.protobuf === "google-protobuf" && alias) {
      f.print("    return data instanceof ", alias, ";");
    } else {
      f.print("    return data instanceof ", protoTypeImport, ";");
    }
    f.print("  },");
    
    // Print sourceType
    f.print("  ", JSON.stringify("sourceType"), ": { ", 
      JSON.stringify("module"), ": __filename, ",
      JSON.stringify("export"), ": ", JSON.stringify(reExportedPbTypeName), " },");
  }
  
  // Print extensions if exists
  if (cleanedOpts.extensions) {
    f.print("  ", JSON.stringify("extensions"), ": ", JSON.stringify(cleanedOpts.extensions), ",");
  }
  
  f.print("});");
}

function printFieldDefinition(
  f: GeneratedFile,
  field: ObjectField<any> | ObjectOneofField,
  registry: Registry,
  opts: NexusPrinterOptions,
): void {
  f.print("    t.field(", JSON.stringify(field.name), ", {");
  
  // Print type
  printFieldType(f, field, opts);
  
  // Print description
  if (field.description) {
    f.print("      ", JSON.stringify("description"), ": ", JSON.stringify(field.description), ",");
  }
  
  // Print deprecation
  if (field.deprecationReason) {
    f.print("      ", JSON.stringify("deprecation"), ": ", JSON.stringify(field.deprecationReason), ",");
  }
  
  // Print resolver
  if (!field.isResolverSkipped()) {
    printResolver(f, field, opts);
  } else {
    f.print('      ', JSON.stringify("resolve"), ': (source) => { throw new Error("not implemented"); },');
  }
  
  // Print extensions
  const extensions = protobufGraphQLExtensions(field, registry);
  if (extensions) {
    f.print("      ", JSON.stringify("extensions"), ": ", JSON.stringify(extensions), ",");
  }
  
  f.print("    });");
}

function printFieldType(
  f: GeneratedFile,
  field: ObjectField<any> | ObjectOneofField,
  opts: NexusPrinterOptions,
): void {
  let typeStr: string;
  
  if (field.type instanceof ScalarType) {
    typeStr = JSON.stringify(field.type.typeName);
  } else {
    // For object/enum/interface types
    typeStr = JSON.stringify(field.type.typeName);
  }
  
  // Build the type expression
  let typeExpr = typeStr;
  
  if (field.isList()) {
    const nonNullImport = f.import("nonNull", "nexus");
    const listImport = f.import("list", "nexus");
    typeExpr = `${nonNullImport}(${typeStr})`;
    typeExpr = `${listImport}(${typeExpr})`;
  }
  
  const wrapperFunc = field.isNullable() ? "nullable" : "nonNull";
  const wrapperImport = f.import(wrapperFunc, "nexus");
  
  f.print("      ", JSON.stringify("type"), ": ", wrapperImport, "(", typeExpr, "),");
}

function printResolver(
  f: GeneratedFile,
  field: ObjectField<any> | ObjectOneofField,
  opts: NexusPrinterOptions,
): void {
  f.print("      ", JSON.stringify("resolve"), ": (source) => {");
  
  if (field instanceof ObjectOneofField || field.type instanceof SquashedOneofUnionType) {
    // Handle oneof fields
    printOneofResolver(f, field, opts);
  } else if (field instanceof ObjectField) {
    // Regular field
    if (opts.protobuf === "google-protobuf") {
      const getterName = `get${pascalCase(field.proto.name)}`;
      
      if (field.isList()) {
        f.print("        return source.", getterName, "List().map((value) => {");
        printFieldValueTransform(f, field, "value", opts);
        f.print("        });");
      } else {
        f.print("        const value = source.", getterName, "();");
        
        // Null check for non-nullable fields
        if (!field.isNullable() && !(field.type instanceof ScalarType && field.type.isPrimitive())) {
          f.print("        if (value == null) {");
          f.print('          throw new Error("Cannot return null for non-nullable field");');
          f.print("        }");
        }
        
        printFieldValueTransform(f, field, "value", opts);
      }
    } else {
      // protobufjs - use direct property access
      const fieldName = tsFieldName(field.proto, opts);
      
      if (field.isList()) {
        f.print("        return source.", fieldName, ".map((value) => {");
        printFieldValueTransform(f, field, "value", opts);
        f.print("        });");
      } else {
        f.print("        const value = source.", fieldName, ";");
        
        // Null check for non-nullable fields
        if (!field.isNullable()) {
          f.print("        if (value == null) {");
          f.print('          throw new Error("Cannot return null for non-nullable field");');
          f.print("        }");
        }
        
        printFieldValueTransform(f, field, "value", opts);
      }
    }
  }
  
  f.print("      },");
}

function printOneofResolver(
  f: GeneratedFile,
  field: ObjectOneofField | ObjectField<SquashedOneofUnionType>,
  opts: NexusPrinterOptions,
): void {
  const oneofUnion = field instanceof ObjectOneofField ? field.type : field.type as SquashedOneofUnionType;
  const oneofProto = field instanceof ObjectOneofField ? field.proto : oneofUnion.proto.oneofs[0];
  
  if (opts.protobuf === "google-protobuf") {
    const oneofName = pascalCase(oneofProto.name);
    const parentType = field instanceof ObjectOneofField 
      ? getProtoTypeImport(oneofProto.parent, opts).importName
      : getProtoTypeImport(oneofUnion.proto, opts).importName;
    
    f.print("        switch (source.get", oneofName, "Case()) {");
    
    for (const oneofField of oneofUnion.fields) {
      const caseName = constantCase(oneofField.proto.name);
      f.print("          case ", parentType, ".", oneofName, "Case.", caseName, ": {");
      f.print("            return source.get", pascalCase(oneofField.proto.name), "();");
      f.print("          }");
    }
    
    f.print("          default: {");
    if (field.isNullable() && !field.isList()) {
      f.print("            return null;");
    } else {
      const fieldNames = oneofUnion.fields.map(f => f.proto.name);
      f.print(`            throw new Error("One of the following fields must be non-null: ${fieldNames.join(", ")}");`);
    }
    f.print("          }");
    f.print("        }");
  } else {
    // protobufjs
    for (const oneofField of oneofUnion.fields) {
      const fieldName = tsFieldName(oneofField.proto, opts);
      f.print("        if (source.", fieldName, " != null) {");
      f.print("          return source.", fieldName, ";");
      f.print("        }");
    }
    
    if (field.isNullable() && !field.isList()) {
      f.print("        return null;");
    } else {
      const fieldNames = oneofUnion.fields.map(f => f.proto.name);
      f.print(`        throw new Error("One of the following fields must be non-null: ${fieldNames.join(", ")}");`);
    }
  }
}

function printFieldValueTransform(
  f: GeneratedFile,
  field: ObjectField<any>,
  valueVar: string,
  opts: NexusPrinterOptions,
): void {
  if (field.type instanceof EnumType) {
    // Check for unspecified value
    if (field.type.unspecifiedValue) {
      const enumType = getProtoTypeImport(field.type.proto, opts).importName;
      f.print("        if (", valueVar, " === ", enumType, ".", field.type.unspecifiedValue.proto.name, ") {");
      if (field.isNullable() && !field.isList()) {
        f.print("          return null;");
      } else {
        f.print(`          throw new Error("${field.name} is required field. But got unspecified.");`);
      }
      f.print("        }");
    }
    
    // Check for ignored values
    for (const ev of field.type.valuesWithIgnored) {
      if (ev.isIgnored()) {
        const enumType = getProtoTypeImport(field.type.proto, opts).importName;
        f.print("        if (", valueVar, " === ", enumType, ".", ev.proto.name, ") {");
        if (field.isNullable() && !field.isList()) {
          f.print("          return null;");
        } else {
          f.print(`          throw new Error("${ev.name} is not defined in GraphQL Schema.");`);
        }
        f.print("        }");
      }
    }
  }
  
  if (isProtobufWellKnownTypeField(field.proto)) {
    const transformerImport = f.import("getTransformer", "proto-nexus");
    f.print("        return ", transformerImport, '("', field.proto.message.typeName, '").protoToGql(', valueVar, ");");
  } else if (isProtobufLong(field.proto)) {
    f.print("        return ", valueVar, ".toString();");
  } else {
    f.print("        return ", valueVar, ";");
  }
}

function getProtoTypeImport(
  proto: any,
  opts: NexusPrinterOptions,
): { importName: string; importPath: string; alias?: string } {
  // Get chunks for namespace
  let p = proto;
  const chunks = [p.name];
  while (p.parent != null) {
    p = p.parent;
    chunks.unshift(p.name);
  }
  
  switch (opts.protobuf) {
    case "google-protobuf": {
      // For google-protobuf, import with alias to handle conflicts
      const baseName = chunks[chunks.length - 1];
      const importName = baseName;
      const alias = `${baseName}1`;
      const protoFileName = proto.file.name.replace(/\.proto$/, "_pb");
      const importPath = `${opts.importPrefix || "."}/${protoFileName}`;
      
      // Return the import with an alias marker
      return { 
        importName: `${importName} as ${alias}`, 
        importPath,
        alias 
      };
    }
    case "protobufjs": {
      // For protobufjs, get the full namespace from typeName
      const fullTypeName = proto.typeName;
      const parts = fullTypeName.split(".");
      const rootNamespace = parts[0]; // e.g., "testapis"
      
      // Build import path from file name
      const filePathParts = proto.file.name.replace(/\.proto$/, "").split("/");
      const importPath = `${opts.importPrefix || "."}/${filePathParts.join("/")}`;
      
      return { importName: rootNamespace, importPath };
    }
    default:
      throw new Error(`Unsupported protobuf library: ${opts.protobuf}`);
  }
}