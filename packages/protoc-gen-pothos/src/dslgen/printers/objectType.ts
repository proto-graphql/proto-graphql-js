import type { DescField, Registry } from "@bufbuild/protobuf";
import {
  InterfaceType,
  type ObjectType,
  compact,
  protoType,
  protobufGraphQLExtensions,
  tsFieldName,
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
