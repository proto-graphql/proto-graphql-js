import { type Registry, toJson } from "@bufbuild/protobuf";
import {
  EnumOptionsSchema,
  EnumValueOptionsSchema,
  FieldOptionsSchema,
  MessageOptionsSchema,
  OneofOptionsSchema,
} from "@bufbuild/protobuf/wkt";
import {
  isEnumField,
  isMapField,
  isMessageField,
  isScalarField,
} from "../proto/util.js";
import {
  EnumType,
  EnumTypeValue,
  InputObjectField,
  InputObjectType,
  ObjectField,
  ObjectOneofField,
  ObjectType,
  OneofUnionType,
  SquashedOneofUnionType,
  scalarMapLabelByType,
} from "../types/index.js";

export function protobufGraphQLExtensions(
  type:
    | ObjectType
    | InputObjectType
    | EnumType
    | OneofUnionType
    | SquashedOneofUnionType
    | ObjectField<any>
    | ObjectOneofField
    | InputObjectField<any>
    | EnumTypeValue,
  registry: Registry,
): Record<string, Record<string, unknown>> {
  if (type instanceof ObjectType || type instanceof InputObjectType) {
    return {
      protobufMessage: {
        fullName: type.proto.typeName,
        name: type.proto.name,
        package: type.proto.file.proto.package ?? "",
        options: type.proto.proto.options
          ? toJson(MessageOptionsSchema, type.proto.proto.options, { registry })
          : undefined,
      },
    };
  }
  if (type instanceof EnumType) {
    return {
      protobufEnum: {
        name: type.proto.name,
        fullName: type.proto.typeName,
        package: type.proto.file.proto.package ?? "",
        options: type.proto.proto.options
          ? toJson(EnumOptionsSchema, type.proto.proto.options, { registry })
          : undefined,
      },
    };
  }
  if (
    type instanceof OneofUnionType ||
    type instanceof SquashedOneofUnionType
  ) {
    return {
      protobufOneof: {
        fullName:
          type.proto.kind === "oneof"
            ? `${type.proto.parent.typeName}.${type.proto.name}`
            : type.proto.typeName,
        name: type.proto.name,
        messageName:
          type.proto.kind === "oneof" ? type.proto.parent.name : undefined,
        package:
          (type.proto.kind === "message" ? type.proto : type.proto.parent).file
            .proto.package ?? "",
        fields: type.fields.map((f) => ({
          name: f.proto.name,
          type: protoFieldTypeFullName(f),
          options: type.proto.proto.options
            ? toJson(
                type.proto.proto.options.$typeName ===
                  "google.protobuf.OneofOptions"
                  ? OneofOptionsSchema
                  : MessageOptionsSchema,
                type.proto.proto.options,
                { registry },
              )
            : undefined,
        })),
      },
    };
  }
  if (
    type instanceof ObjectField ||
    type instanceof ObjectOneofField ||
    type instanceof InputObjectField
  ) {
    return {
      protobufField: {
        name: type.proto.name,
        typeFullName: protoFieldTypeFullName(type),
        options: type.proto.proto.options
          ? toJson(
              type.proto.proto.options.$typeName ===
                "google.protobuf.OneofOptions"
                ? OneofOptionsSchema
                : FieldOptionsSchema,
              type.proto.proto.options,
              { registry },
            )
          : undefined,
      },
    };
  }
  if (type instanceof EnumTypeValue) {
    return {
      protobufEnumValue: {
        name: type.proto.name,
        options: type.proto.proto.options
          ? toJson(EnumValueOptionsSchema, type.proto.proto.options, {
              registry,
            })
          : undefined,
      },
    };
  }

  /* istanbul ignore next */
  const _exhaustiveCheck: never = type;
  return {};
}

function protoFieldTypeFullName(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>,
): string | undefined {
  if (field instanceof ObjectField || field instanceof InputObjectField) {
    if (isMessageField(field.proto)) {
      return field.proto.message.typeName;
    }
    if (isEnumField(field.proto)) {
      return field.proto.enum.typeName;
    }
    if (isScalarField(field.proto)) {
      return scalarMapLabelByType[field.proto.scalar];
    }
    if (isMapField(field.proto)) {
      return undefined;
    }
    field.proto satisfies never;
    return undefined;
  }
  return undefined;
}
