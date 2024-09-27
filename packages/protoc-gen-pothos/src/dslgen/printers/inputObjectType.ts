import type { Registry } from "@bufbuild/protobuf";
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

import { createFieldRefCode, createNoopFieldRefCode } from "./field";
import {
  type PothosPrinterOptions,
  fieldTypeShape,
  pothosBuilder,
  pothosRef,
  shapeType,
} from "./util";

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
                return code`${localName}: input ? ${toProtoFunc}(input.${f.name}) : undefined,`;
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
