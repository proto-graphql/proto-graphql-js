import type { DescEnum, DescMessage, Registry } from "@bufbuild/protobuf";
import type { GeneratedFile, ImportSymbol } from "@bufbuild/protoplugin";
import {
  EnumType,
  type InputObjectField,
  InputObjectType,
  ScalarType,
  generatedGraphQLTypeImportPath,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";
import type { PothosPrinterOptions } from "./util.js";

/**
 * Helper function to generate toProto function name
 *
 * @example
 * For type "CreateUserInput":
 * Returns: "CreateUserInput$toProto"
 */
function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

/**
 * Prints input object type definition using protoplugin's GeneratedFile API
 *
 * @example
 * ```ts
 * export type CreateUserInput$Shape = {
 *   name: string,
 *   email?: string | null | undefined,
 * };
 *
 * export const CreateUserInput$Ref: InputObjectRef<CreateUserInput$Shape> =
 *   builder.inputRef<CreateUserInput$Shape>("CreateUserInput").implement({
 *     fields: t => ({
 *       name: t.field({
 *         type: "String",
 *         required: true,
 *       }),
 *       email: t.field({
 *         type: "String",
 *         required: false,
 *       }),
 *     }),
 *   });
 *
 * // For protobuf-es only
 * CreateUserInput$Ref.toProto = (input: CreateUserInput$Shape): CreateUser => {
 *   const output = new CreateUser();
 *   output.name = input.name;
 *   if (input.email != null) {
 *     output.email = input.email;
 *   }
 *   return output;
 * }
 * ```
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
  f.print("export type ", shapeTypeName, " = {");
  for (const field of type.fields) {
    const optional = field.isNullable() ? "?" : "";
    const nullable = field.isNullable() ? " | null" : "";

    if (field.type instanceof InputObjectType) {
      const importPath =
        field.type instanceof InputObjectType
          ? generatedGraphQLTypeImportPath(
              field as InputObjectField<InputObjectType>,
              opts,
            )
          : null;
      const shapeTypeStr = `${field.type.typeName}$Shape`;

      if (importPath) {
        f.import(shapeTypeStr, importPath);
      }

      const typeStr = field.isList() ? `Array<${shapeTypeStr}>` : shapeTypeStr;
      f.print("  ", field.name, optional, ": ", typeStr, nullable, ",");
    } else {
      // For scalar/enum types, use the proto type's field
      const { importName, importPath } = getProtoTypeImport(type.proto, opts);
      const protoTypeImportSym = f.import(importName, importPath);
      const fieldName = tsFieldName(field.proto, opts);

      if (
        field.type instanceof ScalarType &&
        field.type.isCustomScalar() &&
        !field.isNullable()
      ) {
        f.print(
          "  ",
          field.name,
          optional,
          ": NonNullable<",
          protoTypeImportSym,
          '["',
          fieldName,
          '"]>',
          nullable,
          ",",
        );
      } else {
        f.print(
          "  ",
          field.name,
          optional,
          ": ",
          protoTypeImportSym,
          '["',
          fieldName,
          '"]',
          nullable,
          ",",
        );
      }
    }
  }
  f.print("};\n");

  // Get the ref name
  const refName = `${type.typeName}$Ref`;

  // Import builder
  const builderPath = opts.pothos?.builderPath || "../builder";
  const builderImport = f.import("builder", builderPath);

  // Print the ref and implementation
  f.print(
    "export const ",
    refName,
    ": ",
    inputObjectRefImport,
    "<",
    shapeTypeName,
    "> =",
  );
  f.print(
    "  ",
    builderImport,
    ".inputRef<",
    shapeTypeName,
    ">(",
    JSON.stringify(type.typeName),
    ").implement({",
  );

  // Print description if exists
  if (type.description) {
    f.print("    description: ", JSON.stringify(type.description), ",");
  }

  // Print fields
  f.print("    fields: t => ({");
  if (type.fields.length > 0) {
    for (const field of type.fields) {
      printInputFieldDefinition(f, field, type, registry, opts);
    }
  } else {
    f.print(
      '      _: t.field({ type: "Boolean", required: false, description: "noop field" }),',
    );
  }
  f.print("    }),");

  // Print extensions if exists
  const extensions = protobufGraphQLExtensions(type, registry);
  if (extensions) {
    f.print("    extensions: ", JSON.stringify(extensions), ",");
  }

  f.print("  });");

  // Print toProto function for protobuf-es
  if (opts.protobuf === "protobuf-es") {
    f.print("");
    printToProtoFunc(f, type, protoTypeImport, opts);
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

  f.print(
    "export function ",
    funcName,
    "(input: ",
    shapeTypeName,
    " | null | undefined): ",
    protoTypeImport,
    " {",
  );
  f.print("  return new ", protoTypeImport, "({");

  // Regular fields
  for (const field of type.fields.filter(
    (field) => field.proto.oneof == null,
  )) {
    const localName = tsFieldName(field.proto, opts);

    if (field.type instanceof InputObjectType) {
      const toProtoFuncStr = getToProtoFuncString(
        f,
        field as InputObjectField<InputObjectType>,
        opts,
      );
      if (field.isList()) {
        f.print(
          `    ${localName}: input?.${field.name}?.map(v => ${toProtoFuncStr}(v)),`,
        );
      } else {
        f.print(
          `    ${localName}: input?.${field.name} ? ${toProtoFuncStr}(input.${field.name}) : undefined,`,
        );
      }
    } else {
      f.print("    ", localName, ": input?.", field.name, " ?? undefined,");
    }
  }

  // Oneof fields
  for (const [oneofName, fields] of Object.entries(oneofFields)) {
    if (fields.length === 0) continue;
    const firstField = fields[0];
    if (!firstField.proto.oneof) continue;
    const oneofLocalName = tsFieldName(firstField.proto.oneof, opts);
    f.print("    ", oneofLocalName, ":");

    for (const field of fields) {
      const fieldLocalName = tsFieldName(field.proto, opts);
      const toProtoFuncStr = getToProtoFuncString(f, field, opts);
      f.print(
        `      input?.${field.name} ? { case: "${fieldLocalName}", value: ${toProtoFuncStr}(input.${field.name}) } :`,
      );
    }

    f.print("      undefined,");
  }

  f.print("  });");
  f.print("}");
}

/**
 * Helper function to get toProto function string
 *
 * @example
 * Returns the function name that converts GraphQL input to protobuf:
 * - Same file: "ProfileInput$toProto"
 * - Different file: imports and returns "ProfileInput$toProto"
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
 *
 * @example
 * For scalar field:
 * ```ts
 * name: t.field({
 *   type: "String",
 *   required: true,
 *   description: "User's name",
 * }),
 * ```
 *
 * For input object field:
 * ```ts
 * profile: t.field({
 *   type: ProfileInput$Ref,
 *   required: false,
 * }),
 * ```
 *
 * For list field:
 * ```ts
 * tags: t.field({
 *   type: ["String"],
 *   required: { list: true, items: true },
 * }),
 * ```
 */
function printInputFieldDefinition(
  f: GeneratedFile,
  field: InputObjectField<any>,
  parentType: InputObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const extensions = protobufGraphQLExtensions(field, registry);

  f.print("      ", field.name, ": t.field({");

  // Determine field type
  let fieldTypeStr: string;

  if (field.type instanceof ScalarType) {
    // Use the mapped scalar type name from the ScalarType instance
    fieldTypeStr = field.type.typeName;

    if (field.isList()) {
      f.print('        type: ["', fieldTypeStr, '"],');
    } else {
      f.print('        type: "', fieldTypeStr, '",');
    }
  } else if (
    field.type instanceof InputObjectType ||
    field.type instanceof EnumType
  ) {
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
    f.print('        type: "String",');
  }

  // Handle required/nullable
  if (field.isNullable()) {
    // Field is nullable (optional)
    f.print("        required: false,");
  } else {
    // Field is required
    if (field.isList()) {
      f.print("        required: { list: true, items: true },");
    } else {
      f.print("        required: true,");
    }
  }

  // Add description
  if (field.description) {
    f.print("        description: ", JSON.stringify(field.description), ",");
  }

  // Add extensions
  if (extensions) {
    f.print("        extensions: ", JSON.stringify(extensions), ",");
  }

  f.print("      }),");
}

/**
 * Helper function to extract import info for proto types
 *
 * @example
 * For message "CreateUserInput" in package "example.v1":
 * - ts-proto: { importName: "example_v1_CreateUserInput", importPath: "./example/v1/user.proto" }
 * - protobuf-es: { importName: "example_v1_CreateUserInput", importPath: "./example/v1/user_pb" }
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
      throw new Error(
        `Unsupported protobuf library for protoplugin: ${opts.protobuf}`,
      );
  }
}
