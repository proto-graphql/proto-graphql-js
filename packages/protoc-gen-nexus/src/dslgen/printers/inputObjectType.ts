import type { DescEnum, DescMessage, Registry } from "@bufbuild/protobuf";
import type { GeneratedFile } from "@bufbuild/protoplugin";
import {
  EnumType,
  type InputObjectField,
  InputObjectType,
  ScalarType,
  generatedGraphQLTypeImportPath,
  isProtobufLong,
  isProtobufWellKnownTypeField,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import type { NexusPrinterOptions } from "./util.js";

/**
 * Prints input object type definition using protoplugin's GeneratedFile API
 */
export function printInputObjectType(
  f: GeneratedFile,
  type: InputObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): void {
  const typeName = `${type.typeName}`;

  // Import Nexus
  const inputObjectTypeImport = f.import("inputObjectType", "nexus");

  // Import proto type
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  const protoTypeImport = f.import(importName, importPath);

  // Start printing the export
  f.print(`export const ${typeName} = Object.assign(`);
  f.print(`  ${inputObjectTypeImport}({`);
  f.print(`    name: ${JSON.stringify(type.typeName)},`);

  // Add description if exists
  if (type.description) {
    f.print(`    description: ${JSON.stringify(type.description)},`);
  }

  // Print definition
  f.print("    definition: (t) => {");
  if (type.fields.length > 0) {
    for (const field of type.fields) {
      printFieldDefinition(f, field, registry, opts);
    }
  } else {
    // Noop field for empty types
    f.print(`      t.field("_", {`);
    f.print(`        type: "Boolean",`);
    f.print("        nullable: true,");
    f.print(`        description: "noop field",`);
    f.print("      });");
  }
  f.print("    },");

  // Add extensions if exists
  const extensions = protobufGraphQLExtensions(type, registry);
  if (extensions) {
    f.print(`    extensions: ${JSON.stringify(extensions)},`);
  }

  f.print("  }),");

  // Add toProto function and _protoNexus metadata
  f.print("  {");
  f.print(`    toProto: ${printToProtoFunction(f, type, registry, opts)},`);
  f.print("    _protoNexus: {");
  f.print("      fields: {");
  for (const field of type.fields) {
    const fieldExtensions = protobufGraphQLExtensions(field, registry);
    f.print(`        ${field.name}: {`);
    f.print(`          type: ${getFieldTypeString(field, f, opts)},`);
    if (fieldExtensions) {
      f.print(`          extensions: ${JSON.stringify(fieldExtensions)},`);
    }
    f.print("        },");
  }
  f.print("      }");
  f.print("    },");
  f.print("  }");
  f.print(");");
}

/**
 * Helper function to print field definition
 */
function printFieldDefinition(
  f: GeneratedFile,
  field: InputObjectField<any>,
  registry: Registry,
  opts: NexusPrinterOptions,
): void {
  f.print(`      t.field("${field.name}", {`);

  // Determine field type
  if (field.type instanceof ScalarType) {
    const scalarTypeName = getScalarTypeName(field, opts);
    if (field.isList()) {
      f.print(`        type: list("${scalarTypeName}"),`);
      f.import("list", "nexus");
    } else {
      f.print(`        type: "${scalarTypeName}",`);
    }
  } else if (field.type instanceof InputObjectType) {
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    const refName = field.type.typeName;

    if (importPath) {
      f.import(refName, importPath);
    }

    if (field.isList()) {
      f.print(`        type: list(${refName}),`);
      f.import("list", "nexus");
    } else {
      f.print(`        type: ${refName},`);
    }
  } else if (field.type instanceof EnumType) {
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    const refName = field.type.typeName;

    if (importPath) {
      f.import(refName, importPath);
    }

    if (field.isList()) {
      f.print(`        type: list(${refName}),`);
      f.import("list", "nexus");
    } else {
      f.print(`        type: ${refName},`);
    }
  }

  // Handle nullable
  if (field.isNullable()) {
    f.print("        nullable: true,");
  }

  // Add description
  if (field.description) {
    f.print(`        description: ${JSON.stringify(field.description)},`);
  }

  // Add extensions
  const extensions = protobufGraphQLExtensions(field, registry);
  if (extensions) {
    f.print(`        extensions: ${JSON.stringify(extensions)},`);
  }

  f.print("      });");
}

/**
 * Helper function to print toProto function inline
 */
function printToProtoFunction(
  f: GeneratedFile,
  type: InputObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): string {
  const { importName, importPath } = getProtoTypeImport(type.proto, opts);
  const protoType = f.import(importName, importPath);

  const lines: string[] = [];
  lines.push(
    `(input: NexusGen["inputTypes"]["${type.typeName}"]): ${protoType} => {`,
  );
  lines.push(`      const output = new ${protoType}();`);

  for (const field of type.fields) {
    const fieldAssignment = generateFieldAssignment(f, field, registry, opts);
    if (field.isNullable()) {
      lines.push(`      if (input.${field.name} != null) {`);
      lines.push(`        ${fieldAssignment}`);
      lines.push("      }");
    } else {
      lines.push(`      ${fieldAssignment}`);
    }
  }

  lines.push("      return output;");
  lines.push("    }");

  return lines.join("\n");
}

/**
 * Helper function to generate field assignment code
 */
function generateFieldAssignment(
  f: GeneratedFile,
  field: InputObjectField<any>,
  registry: Registry,
  opts: NexusPrinterOptions,
): string {
  const localFieldName = tsFieldName(field.proto, opts);
  let valueExpr = `input.${field.name}`;

  if (field.type instanceof ScalarType) {
    if (isProtobufWellKnownTypeField(field.proto)) {
      const protoFullName = field.proto.message.typeName;
      const transformerImport = f.import(
        "getTransformer",
        "@proto-graphql/nexus",
      );
      const transformer = `${transformerImport}("${protoFullName}")`;

      switch (opts.protobuf) {
        case "google-protobuf":
          valueExpr = `${transformer}.gqlToProto(${valueExpr})`;
          break;
        case "protobufjs": {
          const { importName, importPath } = getProtoTypeImport(
            field.proto.message,
            opts,
          );
          const wktype = f.import(importName, importPath);
          const needsAsAny =
            opts.protobuf === "protobufjs" &&
            (protoFullName === "google.protobuf.Int64Value" ||
              protoFullName === "google.protobuf.UInt64Value" ||
              protoFullName === "google.protobuf.Timestamp");
          valueExpr = `new ${wktype}(${transformer}.gqlToProto(${valueExpr})${needsAsAny ? " as any" : ""})`;
          break;
        }
      }
    } else if (isProtobufLong(field.proto)) {
      const stringToNumberImport = f.import(
        "stringToNumber",
        "@proto-graphql/nexus",
      );
      valueExpr = `${stringToNumberImport}(${valueExpr})`;
    }
  } else if (field.type instanceof InputObjectType) {
    const importPath = generatedGraphQLTypeImportPath(
      field as InputObjectField<InputObjectType>,
      opts,
    );
    const typeName = field.type.typeName;

    if (importPath) {
      f.import(typeName, importPath);
    }

    valueExpr = `${typeName}.toProto(${valueExpr})`;
  }

  if (field.isList()) {
    valueExpr = `${valueExpr}.map(v => ${field.type instanceof InputObjectType ? `${field.type.typeName}.toProto(v)` : "v"})`;
  }

  // Generate the assignment based on protobuf library
  switch (opts.protobuf) {
    case "google-protobuf":
      return `output.set${localFieldName.charAt(0).toUpperCase() + localFieldName.slice(1)}(${valueExpr});`;
    case "protobufjs":
      return `output.${localFieldName} = ${valueExpr};`;
    default:
      return `output.${localFieldName} = ${valueExpr};`;
  }
}

/**
 * Helper function to get scalar type name for Nexus
 */
function getScalarTypeName(
  field: InputObjectField<ScalarType>,
  opts: NexusPrinterOptions,
): string {
  // Use the mapped scalar type name from the ScalarType instance
  return field.type.typeName;
}

/**
 * Helper function to get field type string for _protoNexus metadata
 */
function getFieldTypeString(
  field: InputObjectField<any>,
  f: GeneratedFile,
  opts: NexusPrinterOptions,
): string {
  if (field.type instanceof ScalarType) {
    const typeName = getScalarTypeName(field, opts);
    return field.isList() ? `["${typeName}"]` : `"${typeName}"`;
  }
  if (field.type instanceof InputObjectType || field.type instanceof EnumType) {
    const importPath = generatedGraphQLTypeImportPath(field, opts);
    const refName = field.type.typeName;

    if (importPath) {
      f.import(refName, importPath);
    }

    return field.isList() ? `[${refName}]` : refName;
  }

  return '"String"';
}

/**
 * Helper function to extract import info for proto types
 */
function getProtoTypeImport(
  proto: DescMessage | DescEnum,
  opts: NexusPrinterOptions,
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
    case "google-protobuf": {
      const importName = chunks.join(".");
      const protoFileName = proto.file.name.replace(/\.proto$/, "_pb");
      const importPath = `${opts.importPrefix || "."}/${protoFileName}`;
      return { importName, importPath };
    }
    case "protobufjs": {
      const importName = chunks.join(".");
      const importPath = `${opts.importPrefix || "."}/${proto.file.name}`;
      return { importName, importPath };
    }
    default:
      throw new Error(
        `Unsupported protobuf library for protoplugin: ${opts.protobuf}`,
      );
  }
}
