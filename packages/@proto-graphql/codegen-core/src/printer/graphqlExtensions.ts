import { compact } from "./util";
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
} from "../types";

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
    | EnumTypeValue
): Record<string, Record<string, string>> {
  if (type instanceof ObjectType || type instanceof InputObjectType) {
    return {
      protobufMessage: {
        fullName: type.proto.typeName,
        name: type.proto.name,
        package: type.proto.file.proto.package ?? "",
      },
    };
  }
  if (type instanceof EnumType) {
    return {
      protobufEnum: {
        name: type.proto.name,
        fullName: type.proto.typeName,
        package: type.proto.file.proto.package ?? "",
      },
    };
  }
  if (
    type instanceof OneofUnionType ||
    type instanceof SquashedOneofUnionType
  ) {
    return {
      protobufOneof: compact({
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
        })),
      }),
    };
  }
  if (
    type instanceof ObjectField ||
    type instanceof ObjectOneofField ||
    type instanceof InputObjectField
  ) {
    return {
      protobufField: compact({
        name: type.proto.name,
        typeFullName: protoFieldTypeFullName(type),
      }),
    };
  }
  if (type instanceof EnumTypeValue) {
    return {
      protobufEnumValue: {
        name: type.proto.name,
      },
    };
  }

  /* istanbul ignore next */
  const _exhaustiveCheck: never = type;
  return {};
}

function protoFieldTypeFullName(
  field: ObjectField<any> | ObjectOneofField | InputObjectField<any>
): string | undefined {
  if (field instanceof ObjectField || field instanceof InputObjectField) {
    switch (field.proto.fieldKind) {
      case "message":
        return field.proto.message.typeName;
      case "enum":
        return field.proto.enum.typeName;
      case "scalar":
        return scalarMapLabelByType[field.proto.scalar];
      case "map":
        return undefined;
      default: {
        field.proto satisfies never;
        return undefined;
      }
    }
  }
  return undefined;
}
