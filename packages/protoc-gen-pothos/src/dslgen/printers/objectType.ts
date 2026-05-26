import type { DescField, Registry } from "@bufbuild/protobuf";
import {
  InterfaceType,
  jsStringLit,
  type ObjectType,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import { code, joinCode, type Printable } from "../../codegen/index.js";
import { createFieldRefCode, createNoopFieldRefCode } from "./field.js";
import {
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefPrintable,
  protobufIsMessageSymbol,
  protoRefTypePrintable,
  protoSchemaSymbol,
  protoTypeSymbol,
} from "./util.js";

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
): Printable[] {
  const isInterface = type instanceof InterfaceType;
  const fieldsBody =
    type.fields.length > 0
      ? joinCode(
          type.fields.map(
            (f) => code`${f.name}: ${createFieldRefCode(f, registry, opts)},`,
          ),
        )
      : code`_: ${createNoopFieldRefCode({ input: false })}`;
  const isTypeOf = isInterface
    ? undefined
    : createIsTypeOfFuncCode(type, registry, opts);

  const buildRefFunc = code`${pothosBuilderPrintable(opts)}.${
    isInterface ? "interface" : "object"
  }Ref`;
  const buildTypeFunc = code`${pothosBuilderPrintable(opts)}.${
    isInterface ? "interface" : "object"
  }Type`;
  const refFuncTypeArg = isInterface
    ? code`
        Pick<
          ${protoRefTypePrintable(type.proto, opts)},
          ${type.fields
            .map((f) => jsStringLit(tsFieldName(f.proto as DescField, opts)))
            .join(" | ")}
        >`
    : protoRefTypePrintable(type.proto, opts);

  return code`
    export const ${pothosRefPrintable(
      type,
    )} = ${buildRefFunc}<${refFuncTypeArg}>(${jsStringLit(type.typeName)});
    ${buildTypeFunc}(${pothosRefPrintable(type)}, {
      "name": ${jsStringLit(type.typeName)},
      "fields": t => ({${fieldsBody}}),${
        type.description != null
          ? code`\n      "description": ${jsStringLit(type.description)},`
          : ""
      }${isTypeOf ? code`\n      "isTypeOf": ${isTypeOf},` : ""}
      "extensions": ${protobufGraphQLExtensions(type, registry)},
    });
  `;
}

function createIsTypeOfFuncCode(
  type: ObjectType,
  _registry: Registry,
  opts: PothosPrinterOptions,
): Printable[] {
  switch (opts.protobuf) {
    case "ts-proto": {
      return code`
        (source) => {
          return (source as ${protoTypeSymbol(type.proto, opts)} | { $type: string & {} }).$type
            === ${jsStringLit(type.proto.typeName)};
        }
      `;
    }
    case "protobuf-es-v1": {
      return code`
        (source) => {
          return source instanceof ${protoTypeSymbol(type.proto, opts)}
        }
      `;
    }
    case "protobuf-es": {
      return code`
        (source) => {
          return ${protobufIsMessageSymbol()}(source, ${protoSchemaSymbol(type.proto, opts)})
        }
      `;
    }
  }
}
