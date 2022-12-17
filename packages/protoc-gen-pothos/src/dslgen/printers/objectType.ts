import {
  compact,
  InterfaceType,
  ObjectType,
  protobufGraphQLExtensions,
  protoType,
} from "@proto-graphql/codegen-core";
import { ProtoField } from "@proto-graphql/proto-descriptors";
import { Code, code, joinCode, literalOf } from "ts-poet";

import { createFieldRefCode, createNoopFieldRefCode } from "./field";
import { pothosBuilder, PothosPrinterOptions, pothosRef } from "./util";

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
  opts: PothosPrinterOptions
): Code {
  const isInterface = type instanceof InterfaceType;
  const typeOpts = {
    name: type.typeName,
    fields: code`t => ({${
      type.fields.length > 0
        ? joinCode(
            type.fields.map(
              (f) => code`${f.name}: ${createFieldRefCode(f, opts)},`
            )
          )
        : code`_: ${createNoopFieldRefCode({ input: false })}`
    }})`,
    description: type.description,
    isTypeOf: isInterface
      ? undefined
      : code`
        (source) => {
          return (source as ${protoType(
            type.proto,
            opts
          )} | { $type: string & {} }).$type
            === ${literalOf(type.proto.fullName.toString())};
        }
      `,
    extensions: protobufGraphQLExtensions(type),
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
              (f) => code`${literalOf((f.proto as ProtoField).jsonName)}`
            ),
            { on: "|" }
          )}
        >`
    : protoType(type.proto, opts);

  return code`
    export const ${pothosRef(
      type
    )} = ${buildRefFunc}<${refFuncTypeArg}>(${literalOf(type.typeName)});
    ${buildTypeFunc}(${pothosRef(type)}, ${literalOf(compact(typeOpts))});
  `;
}
