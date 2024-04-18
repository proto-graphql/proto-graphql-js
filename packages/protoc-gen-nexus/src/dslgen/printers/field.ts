import {
  compact,
  createGetFieldValueCode,
  EnumType,
  InputObjectField,
  InputObjectType,
  InterfaceType,
  isProtobufLong,
  isProtobufWellKnownTypeField,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  protobufGraphQLExtensions,
  protoType,
  ScalarType,
  SquashedOneofUnionType,
} from "@proto-graphql/codegen-core";
import { constantCase, pascalCase } from "change-case";
import { code, Code, joinCode, literalOf } from "ts-poet";

import {
  fieldType,
  impNexus,
  impProtoNexus,
  NexusPrinterOptions,
} from "./util";

/**
 * @
 * ```ts
 * t.field("name", {
 *   // ...
 * })
 * ```
 */
export function createFieldDefinitionCode(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>,
  opts: NexusPrinterOptions
): Code {
  const fieldOpts = {
    type: createTypeCode(field, opts),
    description: field.description,
    deprecation: field.deprecationReason,
    resolve: createResolverCode(field, opts),
    extensions: protobufGraphQLExtensions(field),
  };
  return code`t.field(${literalOf(field.name)}, ${literalOf(
    compact(fieldOpts)
  )});`;
}

export function createNoopFieldDefinitionCode(opts: { input: boolean }): Code {
  return code`
    t.field("_", {
      type: "Boolean",
      description: "noop field",
      ${opts.input ? "" : "resolve: () => true,"}
    });
  `;
}

/**
 * @example
 * ```
 * nonNull(list(noNnull("String")))
 * ```
 */
export function createTypeCode(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>,
  opts: NexusPrinterOptions
): Code {
  let typeCode =
    opts.fileLayout === "proto_file" || field.type instanceof ScalarType
      ? code`${literalOf(field.type.typeName)}`
      : fieldType(field, opts);
  if (field.isList()) {
    typeCode = code`${impNexus("nonNull")}(${typeCode})`;
    typeCode = code`${impNexus("list")}(${typeCode})`;
  }
  return code`${impNexus(
    field.isNullable() ? "nullable" : "nonNull"
  )}(${typeCode})`;
}

/**
 * @example
 * ```
 * (source) => {
 *   // ...
 * }
 * ```
 */
function createResolverCode(
  field:
    | ObjectField<
        | ObjectType
        | InterfaceType
        | SquashedOneofUnionType
        | EnumType
        | ScalarType
      >
    | ObjectOneofField
    | InputObjectField<InputObjectType | EnumType | ScalarType>,
  opts: NexusPrinterOptions
): Code | null {
  if (field instanceof InputObjectField) return null;
  if (field.isResolverSkipped()) {
    return code`(source) => { throw new Error("not implemented"); }`;
  }
  if (
    field instanceof ObjectOneofField ||
    field.type instanceof SquashedOneofUnionType
  ) {
    const oneofFields = (
      field instanceof ObjectOneofField
        ? field.type
        : (field.type as SquashedOneofUnionType)
    ).fields;

    const fieldNames = oneofFields.map((f) => f.proto.name);
    const whenNullCode =
      field.isNullable() && !field.isList()
        ? code`return null;`
        : code`throw new Error("One of the following fields must be non-null: ${fieldNames.join(
            ", "
          )}");`;

    const chunks = [];
    if (field.type instanceof SquashedOneofUnionType && !field.isList()) {
      chunks.push(code`if (value == null) {
        ${whenNullCode}
      }`);
    }
    switch (opts.protobuf) {
      case "google-protobuf": {
        const oneofName = pascalCase(
          (field instanceof ObjectOneofField
            ? field.proto
            : (field.type as SquashedOneofUnionType).proto.oneofs[0]
          ).name
        );
        const oneofParent =
          field instanceof ObjectOneofField
            ? protoType(field.proto.parent, opts)
            : protoType((field.type as SquashedOneofUnionType).proto, opts);
        chunks.push(code`
          switch (value.get${oneofName}Case()) {
            ${oneofFields.map(
              (f) => code`
                case ${oneofParent}.${oneofName}Case.${constantCase(
                  f.proto.name
                )}: {
                  return ${createGetFieldValueCode(
                    code`value`,
                    f.proto,
                    opts
                  )}!;
                }
              `
            )}
            default: { ${whenNullCode} }
          }
        `);
        break;
      }
      case "protobufjs": {
        chunks.push(
          ...oneofFields.map((f) => {
            const valueCode = createGetFieldValueCode(
              code`value`,
              f.proto,
              opts
            );
            return code`
              if (${valueCode} != null) {
                return ${valueCode};
              }
            `;
          }),
          whenNullCode
        );
        break;
      }
      /* istanbul ignore next */
      default: {
        const _exhaustiveCheck: "ts-proto" = opts.protobuf;
        throw new Error(
          `unsupported protobuf implementation: ${opts.protobuf}`
        );
      }
    }
    const fieldValueCode =
      field instanceof ObjectOneofField
        ? code`source`
        : createGetFieldValueCode(code`source`, field.proto, opts);
    if (field.isList()) {
      chunks.unshift(code`return ${fieldValueCode}.map((value) => {`);
      chunks.push(code`});`);
    } else {
      chunks.unshift(code`const value = ${fieldValueCode};`);
    }
    return code`(source) => { ${joinCode(chunks)} }`;
  }

  const chunks = [];

  if (
    !field.isList() &&
    (opts.protobuf === "protobufjs" ||
      (opts.protobuf === "google-protobuf" &&
        !(field.type instanceof ScalarType && field.type.isPrimitive())) ||
      field.type instanceof EnumType)
  ) {
    chunks.push(code`
      if (value == null) {
        ${
          field.isNullable()
            ? "return null;"
            : 'throw new Error("Cannot return null for non-nullable field");'
        }
      }
    `);
  }

  if (field.type instanceof EnumType) {
    if (field.type.unspecifiedValue != null) {
      chunks.push(code`
        if (value === ${protoType(field.type.proto, opts)}.${
          field.type.unspecifiedValue.proto.name
        }) {
          ${
            field.isNullable() && !field.isList()
              ? "return null;"
              : `throw new Error("${field.name} is required field. But got unspecified.");`
          }
        }
      `);
    }
    for (const ev of field.type.valuesWithIgnored) {
      if (ev.isIgnored()) {
        chunks.push(code`
          if (value === ${protoType(field.type.proto, opts)}.${ev.proto.name}) {
            ${
              field.isNullable() && !field.isList()
                ? "return null;"
                : `throw new Error("${ev.name} is not defined in GraphQL Schema.");`
            }
          }
        `);
      }
    }
  }

  if (isProtobufWellKnownTypeField(field.proto)) {
    const transformer = code`${impProtoNexus("getTransformer")}("${
      field.proto.message.typeName
    }")`;
    chunks.push(code`return ${transformer}.protoToGql(value);`);
  } else if (isProtobufLong(field.proto)) {
    chunks.push(code`return value.toString();`);
  } else {
    chunks.push(code`return value;`);
  }

  if (field instanceof ObjectField) {
    const fieldValueCode = createGetFieldValueCode(
      code`source`,
      field.proto,
      opts
    );
    if (field.isList()) {
      chunks.unshift(code`return ${fieldValueCode}.map((value) => {`);
      chunks.push(code`});`);
    } else {
      chunks.unshift(code`const value = ${fieldValueCode};`);
    }
  }

  return code`(source) => { ${joinCode(chunks)} }`;
}
