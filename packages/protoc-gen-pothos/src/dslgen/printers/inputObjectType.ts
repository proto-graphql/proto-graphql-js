import type { Registry } from "@bufbuild/protobuf";
import {
  EnumType,
  type InputObjectField,
  InputObjectType,
  protobufGraphQLExtensions,
  ScalarType,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import {
  code,
  compactForCodegen,
  createImportSymbol,
  joinCode,
  literalOf,
  type Printable,
} from "../../codegen/index.js";
import { createFieldRefCode, createNoopFieldRefCode } from "./field.js";
import {
  fieldTypeShapePrintable,
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefPrintable,
  protobufCreateSymbol,
  protoSchemaSymbol,
  protoTypeSymbol,
  shapeTypePrintable,
  toProtoFuncName,
  toProtoFuncPrintable,
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
): Printable[] {
  const fields = type.fields.filter(
    (f) =>
      !(
        type.options.ignoreNonMessageOneofFields &&
        f.proto.oneof != null &&
        !(f.type instanceof InputObjectType)
      ),
  );

  const shapeTypeCode = code`
    export type ${shapeTypePrintable(type)} = {
      ${joinCode(
        fields.map((f) => {
          let typeNode: Printable[];
          if (f.type instanceof InputObjectType) {
            typeNode = fieldTypeShapePrintable(
              f as InputObjectField<InputObjectType>,
              opts,
            );
            if (f.isList()) typeNode = code`Array<${typeNode}>`;
          } else {
            typeNode = code`${protoTypeSymbol(type.proto, opts)}[${literalOf(
              tsFieldName(f.proto, opts).toString(),
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

  // In protobuf-es v2, Message types have internal properties like $unknown and $typeName,
  // which can cause type mismatches between Pothos's inferred types and the InputShape type.
  // To work around this, we use a type assertion for protobuf-es v2.
  const needsTypeAssertion = opts.protobuf === "protobuf-es";
  const inputObjectRefType = code`${createImportSymbol(
    "InputObjectRef",
    "@pothos/core",
  )}<${shapeTypePrintable(type)}>`;

  const refCode = code`
    export const ${pothosRefPrintable(type)}: ${inputObjectRefType} =
      ${pothosBuilderPrintable(opts)}.inputRef<${shapeTypePrintable(
        type,
      )}>(${literalOf(type.typeName)}).implement(
        ${literalOf(
          compactForCodegen({
            fields: code`t => ({${
              fields.length > 0
                ? joinCode(
                    fields.map(
                      (f) =>
                        code`${f.name}: ${createFieldRefCode(
                          f,
                          registry,
                          opts,
                        )}`,
                    ),
                    ", ",
                  )
                : code`_: ${createNoopFieldRefCode({ input: true })}`
            }})`,
            extensions: protobufGraphQLExtensions(type, registry),
            description: type.description,
          }),
        )}
      )${needsTypeAssertion ? code` as ${inputObjectRefType}` : ""};
  `;

  const codes: Printable[][] = [shapeTypeCode, refCode];

  if (opts.protobuf === "protobuf-es-v1" || opts.protobuf === "protobuf-es") {
    codes.push(createToProtoFuncCode(type, fields, opts));
  }

  return joinCode(codes, "\n\n");
}

function createToProtoFuncCode(
  type: InputObjectType,
  fields: InputObjectField<ScalarType | EnumType | InputObjectType>[],
  opts: PothosPrinterOptions,
): Printable[] {
  const oneofFields: Record<string, InputObjectField<InputObjectType>[]> = {};
  for (const f of fields) {
    if (f.proto.oneof == null) continue;
    if (!(f.type instanceof InputObjectType)) {
      // Non-message oneof members are ignored in toProto generation.
      // The strict validation path is handled in type construction.
      continue;
    }

    oneofFields[f.proto.oneof.name] = [
      ...(oneofFields[f.proto.oneof.name] || []),
      f as InputObjectField<InputObjectType>,
    ];
  }

  const protoTypeSym = protoTypeSymbol(type.proto, opts);

  const fieldAssignments = joinCode(
    fields
      .filter((f) => f.proto.oneof == null)
      .map((f) => {
        const localName = tsFieldName(f.proto, opts).toString();
        if (f.type instanceof InputObjectType) {
          const toProtoFunc = toProtoFuncPrintable(
            f as InputObjectField<InputObjectType>,
            opts,
          );
          if (f.isList()) {
            return code`${localName}: input?.${f.name}?.map(v => ${toProtoFunc}(v)),`;
          }
          return code`${localName}: input?.${f.name} ? ${toProtoFunc}(input.${f.name}) : undefined,`;
        }
        if (f.type instanceof ScalarType || f.type instanceof EnumType) {
          return code`${localName}: input?.${f.name} ?? undefined,`;
        }
        f.type satisfies never;
        throw new Error("unreachable");
      }),
    "\n",
  );

  const oneofAssignments = joinCode(
    Object.values(oneofFields).map((fields) => {
      const oneofName = tsFieldName(
        // biome-ignore lint/style/noNonNullAssertion: we know it's not null
        fields[0]!.proto.oneof!,
        opts,
      ).toString();
      const cases = fields.map((f) => {
        const caseName = tsFieldName(f.proto, opts).toString();
        return code`input?.${f.name} ? { case: "${caseName}", value: ${toProtoFuncPrintable(f, opts)}(input.${f.name}) } :`;
      });
      return code`${oneofName}: ${joinCode(cases, " ")} undefined,`;
    }),
    "\n",
  );

  if (opts.protobuf === "protobuf-es") {
    const protoSchemaSym = protoSchemaSymbol(type.proto, opts);
    return code`
      export function ${toProtoFuncName(type)} (input: ${shapeTypePrintable(
        type,
      )} | null | undefined): ${protoTypeSym} {
        return ${protobufCreateSymbol()}(${protoSchemaSym}, {
          ${fieldAssignments}
          ${oneofAssignments}
        });
      }
    `;
  }

  return code`
    export function ${toProtoFuncName(type)} (input: ${shapeTypePrintable(
      type,
    )} | null | undefined): ${protoTypeSym} {
      return new ${protoTypeSym}({
        ${fieldAssignments}
        ${oneofAssignments}
      });
    }
  `;
}
