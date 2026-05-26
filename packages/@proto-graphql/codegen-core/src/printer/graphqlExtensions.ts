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
import { jsStringLit } from "./util.js";

/**
 * Emit the GraphQL `extensions: { ... }` block for a given Pothos type/field as
 * a pre-built JS expression string. Returned by-string (rather than as a JS
 * object that the caller would then run through `literalOf`) so the hot path
 * skips the recursive generic literal serialisation in `helpers.literalOf`
 * — that recursion was the dominant remaining JS hot path after #517 disabled
 * the in-plugin formatter.
 */
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
): string {
  if (type instanceof ObjectType || type instanceof InputObjectType) {
    const pkg = type.proto.file.proto.package ?? "";
    const optionsEntry = type.proto.proto.options
      ? `,options:${JSON.stringify(
          toJson(MessageOptionsSchema, type.proto.proto.options, { registry }),
        )}`
      : "";
    return `{protobufMessage:{fullName:${jsStringLit(type.proto.typeName)},name:${jsStringLit(type.proto.name)},package:${jsStringLit(pkg)}${optionsEntry}}}`;
  }
  if (type instanceof EnumType) {
    const pkg = type.proto.file.proto.package ?? "";
    const optionsEntry = type.proto.proto.options
      ? `,options:${JSON.stringify(
          toJson(EnumOptionsSchema, type.proto.proto.options, { registry }),
        )}`
      : "";
    return `{protobufEnum:{name:${jsStringLit(type.proto.name)},fullName:${jsStringLit(type.proto.typeName)},package:${jsStringLit(pkg)}${optionsEntry}}}`;
  }
  if (
    type instanceof OneofUnionType ||
    type instanceof SquashedOneofUnionType
  ) {
    const fullName =
      type.proto.kind === "oneof"
        ? `${type.proto.parent.typeName}.${type.proto.name}`
        : type.proto.typeName;
    const messageNameEntry =
      type.proto.kind === "oneof"
        ? `,messageName:${jsStringLit(type.proto.parent.name)}`
        : "";
    const pkg =
      (type.proto.kind === "message" ? type.proto : type.proto.parent).file
        .proto.package ?? "";
    const fields = type.fields
      .map((f) => {
        const typeFullName = protoFieldTypeFullName(f);
        const typeEntry =
          typeFullName !== undefined
            ? `,type:${jsStringLit(typeFullName)}`
            : "";
        const optionsEntry = type.proto.proto.options
          ? `,options:${JSON.stringify(
              toJson(
                type.proto.proto.options.$typeName ===
                  "google.protobuf.OneofOptions"
                  ? OneofOptionsSchema
                  : MessageOptionsSchema,
                type.proto.proto.options,
                { registry },
              ),
            )}`
          : "";
        return `{name:${jsStringLit(f.proto.name)}${typeEntry}${optionsEntry}}`;
      })
      .join(",");
    return `{protobufOneof:{fullName:${jsStringLit(fullName)},name:${jsStringLit(type.proto.name)}${messageNameEntry},package:${jsStringLit(pkg)},fields:[${fields}]}}`;
  }
  if (
    type instanceof ObjectField ||
    type instanceof ObjectOneofField ||
    type instanceof InputObjectField
  ) {
    const typeFullName = protoFieldTypeFullName(type);
    const typeFullNameEntry =
      typeFullName !== undefined
        ? `,typeFullName:${jsStringLit(typeFullName)}`
        : "";
    const optionsEntry = type.proto.proto.options
      ? `,options:${JSON.stringify(
          toJson(
            type.proto.proto.options.$typeName ===
              "google.protobuf.OneofOptions"
              ? OneofOptionsSchema
              : FieldOptionsSchema,
            type.proto.proto.options,
            { registry },
          ),
        )}`
      : "";
    return `{protobufField:{name:${jsStringLit(type.proto.name)}${typeFullNameEntry}${optionsEntry}}}`;
  }
  if (type instanceof EnumTypeValue) {
    const optionsEntry = type.proto.proto.options
      ? `,options:${JSON.stringify(
          toJson(EnumValueOptionsSchema, type.proto.proto.options, {
            registry,
          }),
        )}`
      : "";
    return `{protobufEnumValue:{name:${jsStringLit(type.proto.name)}${optionsEntry}}}`;
  }

  /* istanbul ignore next */
  const _exhaustiveCheck: never = type;
  return "{}";
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
