import type { DescField, Registry } from "@bufbuild/protobuf";
import {
  InterfaceType,
  type ObjectType,
  protobufGraphQLExtensions,
  tsFieldName,
} from "@proto-graphql/codegen-core";

import {
  code,
  compactForCodegen,
  joinCode,
  literalOf,
  type Printable,
} from "../../codegen/index.js";
import { createFieldRefCode, createNoopFieldRefCode } from "./field.js";
import {
  type PothosPrinterOptions,
  pothosBuilderPrintable,
  pothosRefPrintable,
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
  const buildRefFunc = code`${pothosBuilderPrintable(opts)}.${
    isInterface ? "interface" : "object"
  }Ref`;
  const buildTypeFunc = code`${pothosBuilderPrintable(opts)}.${
    isInterface ? "interface" : "object"
  }Type`;
  const refFuncTypeArg = isInterface
    ? code`
        Pick<
          ${protoTypeSymbol(type.proto, opts)},
          ${joinCode(
            type.fields.map((f) =>
              literalOf(tsFieldName(f.proto as DescField, opts)),
            ),
            "|",
          )}
        >`
    : code`${protoTypeSymbol(type.proto, opts)}`;

  return code`
    export const ${pothosRefPrintable(
      type,
    )} = ${buildRefFunc}<${refFuncTypeArg}>(${literalOf(type.typeName)});
    ${buildTypeFunc}(${pothosRefPrintable(type)}, ${literalOf(compactForCodegen(typeOpts))});
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
            === ${literalOf(type.proto.typeName)};
        }
      `;
    }
    case "protobuf-es": {
      return code`
        (source) => {
          return source instanceof ${protoTypeSymbol(type.proto, opts)}
        }
      `;
    }
  }
}
