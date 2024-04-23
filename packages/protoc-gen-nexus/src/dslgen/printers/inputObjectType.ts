import {
  compact,
  createSetFieldValueCode,
  InputObjectField,
  InputObjectType,
  isProtobufLong,
  isProtobufWellKnownTypeField,
  protobufGraphQLExtensions,
  protoType,
  Registry,
  ScalarType,
} from "@proto-graphql/codegen-core";
import { Code, code, joinCode, literalOf } from "ts-poet";

import {
  createFieldDefinitionCode,
  createNoopFieldDefinitionCode,
  createTypeCode,
} from "./field";
import {
  fieldType,
  impNexus,
  impProtoNexus,
  NexusPrinterOptions,
  nexusTypeDef,
} from "./util";

/**
 * @example
 * ```ts
 * export cosnt HelloInput = Object.assign(
 *   inputObjectType({
 *     name: "HelloInput",
 *     // ...
 *   }),
 *   {
 *     toProto: (input: NexusGen['inputTypes']['HelloInput']): _$hello$hello_pb.Hello => {
 *       // ...
 *     }
 *   },
 * )
 * ```
 */
export function createInputObjectTypeCode(
  type: InputObjectType,
  registry: Registry,
  opts: NexusPrinterOptions,
): Code {
  const typeOpts = {
    name: type.typeName,
    description: type.description,
    definition: code`(t) => {
      ${
        type.fields.length > 0
          ? joinCode(
              type.fields.map((f) =>
                createFieldDefinitionCode(f, registry, opts),
              ),
            )
          : createNoopFieldDefinitionCode({ input: true })
      }
    }`,
    extensions: protobufGraphQLExtensions(type, registry),
  };
  return code`
    export const ${nexusTypeDef(type)} = Object.assign(
      ${impNexus("inputObjectType")}(${literalOf(compact(typeOpts))}),
      {
        toProto: ${createToProtoFuncCode(type, opts)},
        _protoNexus: {
          fields: {
            ${joinCode(
              type.fields.map(
                (f) =>
                  code`${f.name}: ${literalOf({
                    type: createTypeCode(f, opts),
                    extensions: protobufGraphQLExtensions(f, registry),
                  })},`,
              ),
            )}
          },
        },
      }
    );
  `;
}

export function createToProtoFuncCode(
  type: InputObjectType,
  opts: NexusPrinterOptions,
): Code {
  return code`
    (input: NexusGen["inputTypes"][${literalOf(type.typeName)}]): ${protoType(
      type.proto,
      opts,
    )} => {
      const output = new ${protoType(type.proto, opts)}();
      ${joinCode(
        type.fields.map((f) => {
          let wrapperFunc: (v: Code) => Code = (v) => v;
          if (f.type instanceof ScalarType) {
            if (isProtobufWellKnownTypeField(f.proto)) {
              const protoFullName = f.proto.message.typeName;
              const transformer = code`${impProtoNexus(
                "getTransformer",
              )}("${protoFullName}")`;
              switch (opts.protobuf) {
                case "google-protobuf":
                  wrapperFunc = (v) => code`${transformer}.gqlToProto(${v})`;
                  break;
                case "protobufjs": {
                  const wktype = protoType(f.proto, opts);
                  const needsAsAny =
                    opts.protobuf === "protobufjs" &&
                    (protoFullName === "google.protobuf.Int64Value" ||
                      protoFullName === "google.protobuf.UInt64Value" ||
                      protoFullName === "google.protobuf.Timestamp");
                  wrapperFunc = (v) => {
                    let value = code`${transformer}.gqlToProto(${v})`;
                    if (needsAsAny) value = code`${value} as any`;
                    return code`new ${wktype}(${value})`;
                  };
                  break;
                }
              }
            } else if (isProtobufLong(f.proto)) {
              wrapperFunc = (v) =>
                code`${impProtoNexus("stringToNumber")}(${v})`;
            }
          }
          if (f.type instanceof InputObjectType) {
            const ft = fieldType(f as InputObjectField<InputObjectType>, opts);
            wrapperFunc = (v) => code`${ft}.toProto(${v})`;
          }
          const value = code`input.${f.name}`;
          const stmt = createSetFieldValueCode(
            code`output`,
            f.isList()
              ? code`${value}.map(v => ${wrapperFunc(code`v`)})`
              : wrapperFunc(value),
            f.proto,
            opts,
          );
          if (f.isNullable()) {
            return code`if (input.${f.name} != null) {
              ${stmt};
            }`;
          }
          return code`${stmt};`;
        }),
      )}
      return output;
    }
  `;
}
