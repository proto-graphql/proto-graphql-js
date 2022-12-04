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
} from "../types";
import { compact } from "./util";

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
        fullName: type.proto.fullName.toString(),
        name: type.proto.name,
        package: type.proto.file.package,
      },
    };
  }
  if (type instanceof EnumType) {
    return {
      protobufEnum: {
        name: type.proto.name,
        fullName: type.proto.fullName.toString(),
        package: type.proto.file.package,
      },
    };
  }
  if (type instanceof OneofUnionType || type instanceof SquashedOneofUnionType) {
    return {
      protobufOneof: compact({
        fullName: type.proto.fullName.toString(),
        name: type.proto.name,
        messageName: type.proto.kind === "Oneof" ? type.proto.parent.name : undefined,
        package: (type.proto.kind === "Message" ? type.proto : type.proto.parent).file.package,
        fields: type.fields.map((f) => ({
          name: f.proto.name,
          type: protoFieldTypeFullName(f),
        })),
      }),
    };
  }
  if (type instanceof ObjectField || type instanceof ObjectOneofField || type instanceof InputObjectField) {
    return {
      protobufField: compact({ name: type.proto.name, typeFullName: protoFieldTypeFullName(type) }),
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
  if ((field instanceof ObjectField || field instanceof InputObjectField) && field.proto.type !== null) {
    if (field.proto.type.kind === "Scalar") {
      return field.proto.type.type;
    }
    return field.proto.type.fullName.toString();
  }
  return undefined;
}
