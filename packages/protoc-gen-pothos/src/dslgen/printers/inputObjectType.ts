import type { DescEnum, DescMessage, Registry } from "@bufbuild/protobuf";
import type { GeneratedFile, ImportSymbol } from "@bufbuild/protoplugin";
import {
  EnumType,
  type InputObjectField,
  InputObjectType,
  ScalarType,
  compact,
  generatedGraphQLTypeImportPath,
  protoType,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import { type Code, code, imp, joinCode, literalOf } from "ts-poet";

import { createFieldRefCode, createNoopFieldRefCode } from "./field.js";
import {
  type PothosPrinterOptions,
  fieldTypeShape,
  pothosBuilder,
  pothosRef,
  shapeType,
} from "./util.js";

/**
 * @example
 * ```ts
 * export type HelloInput$Shape = {
 *   // ...
 * }
 * export const HelloInput$Ref: pothos.InputObjectRef<Hello$SHape> = builder.inputRef("HelloInput").implement({
 *   description: "...",
 *   fields: (t) => ({
 *     // ...
 *   }),
 * })
 *
 * export function HelloInput$toProto () {
 *   return {
 *     // ...
 *   }
 * }
 *
 * ```
 */
export function createInputObjectTypeCode(
  type: InputObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): Code {
  const shapeTypeCode = code`
    export type ${shapeType(type)} = {
      ${joinCode(
        type.fields.map((f) => {
          let typeNode: Code;
          if (f.type instanceof InputObjectType) {
            // @ts-expect-error f should be inferred as InputObjectField<InputObjectType>
            typeNode = code`${fieldTypeShape(f, opts)}`;
            if (f.isList()) typeNode = code`Array<${typeNode}>`;
          } else {
            typeNode = code`${protoType(type.proto, opts)}[${literalOf(
              tsFieldName(f.proto, opts),
            )}]`;
          }
          return f.isNullable()
            ? code`${f.name}?: ${typeNode} | null,`
            : code`${f.name}: ${
                f.type instanceof ScalarType && f.type.isCustomScalar()
                  ? code`NonNullable<${typeNode}>`
                  : typeNode
              },`;
        }),
      )}
    };
  `;

  const refCode = code`
    export const ${pothosRef(type)}: ${imp(
      "InputObjectRef@@pothos/core",
    )}<${shapeType(type)}> =
      ${pothosBuilder(type, opts)}.inputRef<${shapeType(type)}>(${literalOf(
        type.typeName,
      )}).implement(
        ${literalOf(
          compact({
            description: type.description,
            fields: code`t => ({${
              type.fields.length > 0
                ? type.fields.map(
                    (f) =>
                      code`${f.name}: ${createFieldRefCode(
                        f,
                        registry,
                        opts,
                      )},`,
                  )
                : code`_: ${createNoopFieldRefCode({ input: true })}`
            }})`,
            extensions: protobufGraphQLExtensions(type, registry),
          }),
        )}
      );
  `;

  const codes = [shapeTypeCode, refCode];

  if (opts.protobuf === "protobuf-es") {
    codes.push(createToProtoFuncCode(type, opts));
  }

  return code` ${codes} `;
}

function createToProtoFuncCode(
  type: InputObjectType,
  opts: PothosPrinterOptions,
): Code {
  const oneofFields: Record<string, InputObjectField<InputObjectType>[]> = {};
  for (const f of type.fields) {
    if (f.proto.oneof == null) continue;
    if (!(f.type instanceof InputObjectType)) {
      throw new Error("Oneof fields must be of message");
    }

    oneofFields[f.proto.oneof.name] = [
      ...(oneofFields[f.proto.oneof.name] || []),
      f as InputObjectField<InputObjectType>,
    ];
  }

  return code`
    export function ${toProtoFuncName(type)} (input: ${shapeType(
      type,
    )} | null | undefined): ${protoType(type.proto, opts)} {
      return new ${protoType(type.proto, opts)}({
        ${type.fields
          .filter((f) => f.proto.oneof == null)
          .map((f) => {
            switch (true) {
              case f.type instanceof InputObjectType: {
                const localName = tsFieldName(f.proto, opts);
                const toProtoFunc = fieldToProtoFunc(
                  f as InputObjectField<InputObjectType>,
                  opts,
                );
                if (f.isList()) {
                  return code`${localName}: input?.${f.name}?.map(v => ${toProtoFunc}(v)),`;
                }
                return code`${localName}: input?.${f.name} ? ${toProtoFunc}(input.${f.name}) : undefined,`;
              }
              case f.type instanceof ScalarType:
              case f.type instanceof EnumType: {
                const localName = tsFieldName(f.proto, opts);
                return code`${localName}: input?.${f.name} ?? undefined,`;
              }
              default: {
                f.type satisfies never;
                throw "unreachable";
              }
            }
          })}
        ${Object.values(oneofFields).map((fields) => {
          return code`${tsFieldName(
            // biome-ignore lint/style/noNonNullAssertion: we know it's not null
            fields[0]!.proto.oneof!,
            opts,
          )}:${fields.map(
            (f) =>
              code`input?.${f.name} ? { case: "${tsFieldName(
                f.proto,
                opts,
              )}", value: ${fieldToProtoFunc(f, opts)}(input.${f.name}) } :`,
          )} undefined,`;
        })}
      });
    }
  `;
}

function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

function fieldToProtoFunc(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Code {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return code`${toProtoFuncName(field.type)}`;

  const imported = imp(`IMPORTED_PLACEHOLDER@${importPath}`);
  imported.symbol = toProtoFuncName(field.type); // NOTE: Workaround for ts-poet not recognizing "$" as an identifier
  return code`${imported}`;
}

/**
 * Prints input object type definition using protoplugin's GeneratedFile API
 */
export function printInputObjectType(
  f: GeneratedFile,
  type: InputObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  // Import necessary types
  const inputObjectRefImport = f.import("InputObjectRef", "@pothos/core");
  
  // Generate proto type import
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  const protoTypeImport = f.import(importName, importPath);
  
  // Print the shape type
  const shapeTypeName = `${type.typeName}$Shape`;
  f.print(`export type ${shapeTypeName} = {`);
  type.fields.forEach((field) => {
    const optional = field.isNullable() ? "?" : "";
    const nullable = field.isNullable() ? " | null" : "";
    
    if (field.type instanceof InputObjectType) {
      const importPath = field.type instanceof InputObjectType ? generatedGraphQLTypeImportPath(field as InputObjectField<InputObjectType>, opts) : null;
      const shapeTypeStr = `${field.type.typeName}$Shape`;
      
      if (importPath) {
        f.import(shapeTypeStr, importPath);
      }
      
      const typeStr = field.isList() ? `Array<${shapeTypeStr}>` : shapeTypeStr;
      f.print(`  ${field.name}${optional}: ${typeStr}${nullable},`);
    } else {
      // For scalar/enum types, use the proto type's field
      const { importName, importPath } = getProtoTypeImport(type.proto, opts);
      const protoTypeImportSym = f.import(importName, importPath);
      const fieldName = tsFieldName(field.proto, opts);
      
      if (field.type instanceof ScalarType && field.type.isCustomScalar() && !field.isNullable()) {
        f.print("  ", field.name, optional, ": NonNullable<", protoTypeImportSym, "[\"", fieldName, "\"]>", nullable, ",");
      } else {
        f.print("  ", field.name, optional, ": ", protoTypeImportSym, "[\"", fieldName, "\"]", nullable, ",");
      }
    }
  });
  f.print(`};`);
  f.print("");
  
  // Get the ref name
  const refName = `${type.typeName}$Ref`;
  
  // Import builder
  const builderPath = opts.pothos?.builderPath || "../builder";
  const builderImport = f.import("builder", builderPath);
  
  // Print the ref and implementation
  f.print("export const ", refName, ": ", inputObjectRefImport, "<", shapeTypeName, "> =");
  f.print("  ", builderImport, ".inputRef<", shapeTypeName, ">(", JSON.stringify(type.typeName), ").implement({");
  
  // Print description if exists
  if (type.description) {
    f.print(`    description: ${JSON.stringify(type.description)},`);
  }
  
  // Print fields
  f.print(`    fields: t => ({`);
  if (type.fields.length > 0) {
    type.fields.forEach((field) => {
      printInputFieldDefinition(f, field, type, registry, opts);
    });
  } else {
    f.print(`      _: t.field({ type: "Boolean", required: false, description: "noop field" }),`);
  }
  f.print(`    }),`);
  
  // Print extensions if exists
  const extensions = protobufGraphQLExtensions(type, registry);
  if (extensions) {
    f.print(`    extensions: ${JSON.stringify(extensions)},`);
  }
  
  f.print(`  });`);
  
  // Print toProto function for protobuf-es
  if (opts.protobuf === "protobuf-es") {
    f.print("");
    printToProtoFunc(f, type, protoTypeImport, opts);
  } else if (opts.protobuf === "ts-proto") {
    // For ts-proto, we don't generate toProto function
  }
}


/**
 * Helper function to print toProto function
 */
function printToProtoFunc(
  f: GeneratedFile,
  type: InputObjectType,
  protoTypeImport: ImportSymbol,
  opts: PothosPrinterOptions,
): void {
  // Group oneof fields
  const oneofFields: Record<string, InputObjectField<InputObjectType>[]> = {};
  for (const field of type.fields) {
    if (field.proto.oneof == null) continue;
    if (!(field.type instanceof InputObjectType)) {
      throw new Error("Oneof fields must be of message");
    }
    
    oneofFields[field.proto.oneof.name] = [
      ...(oneofFields[field.proto.oneof.name] || []),
      field as InputObjectField<InputObjectType>,
    ];
  }
  
  const shapeTypeName = `${type.typeName}$Shape`;
  const funcName = toProtoFuncName(type);
  
  f.print("export function ", funcName, "(input: ", shapeTypeName, " | null | undefined): ", protoTypeImport, " {");
  f.print("  return new ", protoTypeImport, "({");
  
  // Regular fields
  type.fields
    .filter((field) => field.proto.oneof == null)
    .forEach((field) => {
      const localName = tsFieldName(field.proto, opts);
      
      if (field.type instanceof InputObjectType) {
        const toProtoFuncStr = getToProtoFuncString(f, field as InputObjectField<InputObjectType>, opts);
        if (field.isList()) {
          f.print(`    ${localName}: input?.${field.name}?.map(v => ${toProtoFuncStr}(v)),`);
        } else {
          f.print(`    ${localName}: input?.${field.name} ? ${toProtoFuncStr}(input.${field.name}) : undefined,`);
        }
      } else {
        f.print(`    ${localName}: input?.${field.name} ?? undefined,`);
      }
    });
  
  // Oneof fields
  Object.entries(oneofFields).forEach(([oneofName, fields]) => {
    const oneofLocalName = tsFieldName(fields[0]!.proto.oneof!, opts);
    f.print(`    ${oneofLocalName}:`);
    
    fields.forEach((field) => {
      const fieldLocalName = tsFieldName(field.proto, opts);
      const toProtoFuncStr = getToProtoFuncString(f, field, opts);
      f.print(`      input?.${field.name} ? { case: "${fieldLocalName}", value: ${toProtoFuncStr}(input.${field.name}) } :`);
    });
    
    f.print(`      undefined,`);
  });
  
  f.print(`  });`);
  f.print(`}`);
}

/**
 * Helper function to get toProto function string
 */
function getToProtoFuncString(
  f: GeneratedFile,
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): string {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  const funcName = toProtoFuncName(field.type);
  
  if (importPath) {
    f.import(funcName, importPath);
  }
  
  return funcName;
}

/**
 * Helper function to print input field definition
 */
function printInputFieldDefinition(
  f: GeneratedFile,
  field: InputObjectField<any>,
  parentType: InputObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const extensions = protobufGraphQLExtensions(field, registry);
  
  f.print(`      ${field.name}: t.field({`);
  
  // Determine field type
  let fieldTypeStr: string;
  
  if (field.type instanceof ScalarType) {
    // Map scalar types to GraphQL types
    switch (field.type.typeName) {
      case "Int64":
        fieldTypeStr = opts.protobuf === "ts-proto" ? "String" : "Int64";
        break;
      case "Byte":
        fieldTypeStr = "Byte";
        break;
      default:
        fieldTypeStr = field.type.typeName;
    }
    
    if (field.isList()) {
      f.print(`        type: ["${fieldTypeStr}"],`);
    } else {
      f.print(`        type: "${fieldTypeStr}",`);
    }
  } else if (field.type instanceof InputObjectType || field.type instanceof EnumType) {
    // For object/enum types, we need to generate the ref import
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    let refName: string;
    
    if (importPath) {
      refName = `${field.type.typeName}$Ref`;
      f.import(refName, importPath);
    } else {
      refName = `${field.type.typeName}$Ref`;
    }
    
    if (field.isList()) {
      f.print("        type: [", refName, "],");
    } else {
      f.print("        type: ", refName, ",");
    }
  } else {
    // Fallback
    f.print(`        type: "String",`);
  }
  
  // Handle required/nullable
  if (field.isNullable()) {
    // Field is nullable (optional)
    f.print(`        required: false,`);
  } else {
    // Field is required
    if (field.isList()) {
      f.print(`        required: { list: true, items: true },`);
    } else {
      f.print(`        required: true,`);
    }
  }
  
  // Add description
  if (field.description) {
    f.print(`        description: ${JSON.stringify(field.description)},`);
  }
  
  // Add extensions
  if (extensions) {
    f.print(`        extensions: ${JSON.stringify(extensions)},`);
  }
  
  f.print(`      }),`);
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
      throw new Error(`Unsupported protobuf library for protoplugin: ${opts.protobuf}`);
  }
}
