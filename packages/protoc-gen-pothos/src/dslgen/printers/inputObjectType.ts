import type { Registry } from "@bufbuild/protobuf";
import {
  EnumType,
  type InputObjectField,
  InputObjectType,
  ScalarType,
  createProtoTypeExpr,
  generatedGraphQLTypeImportPath,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import {
  type GeneratedFile,
  type Printable,
  createImportSymbol,
} from "@bufbuild/protoplugin";
import { printFieldDefStmt, printNoopFieldDefStmt } from "./field.js";
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
export function printInputObjectTypeCode(
  g: GeneratedFile,
  type: InputObjectType,
  registry: Registry,
  opts: PothosPrinterOptions,
): void {
  const shapeTypeIdent = shapeType(type);
  const protoTypeExpr = createProtoTypeExpr(type.proto, opts);

  // shape
  g.print("export type ", shapeTypeIdent, " = {");
  for (const f of type.fields) {
    let typeNode: Printable;
    if (f.type instanceof InputObjectType) {
      // @ts-expect-error f should be inferred as InputObjectField<InputObjectType>
      typeNode = fieldTypeShape(f, opts);
      if (f.isList()) typeNode = ["Array<", typeNode, ">"];
    } else {
      const fieldNameExpr = g.string(tsFieldName(f.proto, opts));
      typeNode = [protoTypeExpr, "[", fieldNameExpr, "]"];
    }
    if (f.isNullable()) {
      g.print(f.name, "?: ", typeNode, " | null,");
    } else if (f.type instanceof ScalarType && f.type.isCustomScalar()) {
      g.print(f.name, ": NonNullable<", typeNode, ">,");
    } else {
      g.print(f.name, ": ", typeNode, ",");
    }
  }
  g.print("};");

  g.print();

  // ref
  const refIdent = pothosRef(type);
  const coreRefType = createImportSymbol(
    "InputObjectRef",
    "@pothos/core",
    true,
  );
  const refType = [coreRefType, "<", shapeTypeIdent, ">"]; // InputObjectRef<Foo$Shape>
  const buildrExpr = pothosBuilder(type, opts);
  const typeNameExpr = g.string(type.typeName);

  g.print("export const ", refIdent, ": ", refType, " =");
  // biome-ignore format: to make it easy generated code to read
  g.print(buildrExpr, ".inputRef<", shapeTypeIdent, ">(", typeNameExpr, ").implement({");

  if (type.description) {
    g.print("  description: ", g.string(type.description), ",");
  }

  g.print("  fields: t => ({");
  for (const f of type.fields) {
    g.print(f.name, ": ");
    printFieldDefStmt(g, f, registry, opts);
    g.print(",");
  }
  if (type.fields.length === 0) {
    g.print("_: ");
    printNoopFieldDefStmt(g, { input: true });
    g.print(",");
  }
  g.print("}),");

  const extJson = JSON.stringify(protobufGraphQLExtensions(type, registry));
  g.print("  extensions: ", extJson, ",");

  g.print("})");

  if (opts.protobuf === "protobuf-es") {
    g.print();
    printToProtoFuncDefStmt(g, type, opts);
  }
}

function printToProtoFuncDefStmt(
  g: GeneratedFile,
  type: InputObjectType,
  opts: PothosPrinterOptions,
): void {
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

  const funcNameIdent = toProtoFuncName(type);
  const shapeTypeIdent = shapeType(type);
  const protoTypeExpr = createProtoTypeExpr(type.proto, opts);

  g.print("export function ", funcNameIdent, "(");
  g.print("  input: ", shapeTypeIdent, " | null | undefined");
  g.print("): ", protoTypeExpr, "{");

  g.print("  return new ", protoTypeExpr, "({");
  for (const f of type.fields) {
    if (f.proto.oneof != null) continue;

    switch (true) {
      case f.type instanceof InputObjectType: {
        const localName = tsFieldName(f.proto, opts);
        const toProtoFunc = fieldToProtoFunc(
          f as InputObjectField<InputObjectType>,
          opts,
        );
        if (f.isList()) {
          // biome-ignore format: to make it easy generated code to read
          g.print(localName, ": input?.", f.name, "?.map(v => ", toProtoFunc, "(v)),");
        } else {
          // biome-ignore format: to make it easy generated code to read
          g.print(localName, ": input ? ", toProtoFunc, "(input.", f.name, ") : undefined,");
        }
        break;
      }
      case f.type instanceof ScalarType:
      case f.type instanceof EnumType: {
        const localName = tsFieldName(f.proto, opts);
        g.print(localName, ": input?.", f.name, " ?? undefined,");
        break;
      }
      default: {
        f.type satisfies never;
        throw "unreachable";
      }
    }
  }
  for (const fields of Object.values(oneofFields)) {
    const fieldName = tsFieldName(
      // biome-ignore lint/style/noNonNullAssertion: we know it's not null
      fields[0]!.proto.oneof!,
      opts,
    );
    g.print(fieldName, ": ");
    for (const f of fields) {
      const fieldNameExpr = g.string(tsFieldName(f.proto, opts));
      // biome-ignore format: to make it easy generated code to read
      const valueExpr: Printable = [fieldToProtoFunc(f, opts), '(input.',f.name,')']
      // biome-ignore format: to make it easy generated code to read
      g.print("input?.", f.name, " ? { case: ", fieldNameExpr, ", value: ", valueExpr, ' } :');
    }
    g.print(" undefined,");
  }

  g.print("  })");
  g.print("}");
}

function toProtoFuncName(type: InputObjectType): string {
  return `${type.typeName}$toProto`;
}

function fieldToProtoFunc(
  field: InputObjectField<InputObjectType>,
  opts: PothosPrinterOptions,
): Printable {
  const importPath = generatedGraphQLTypeImportPath(field, opts);
  if (importPath == null) return toProtoFuncName(field.type);

  return createImportSymbol(toProtoFuncName(field.type), importPath);
}
