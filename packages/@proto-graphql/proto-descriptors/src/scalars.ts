import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";

type FieldDescriptorScalarType = Exclude<
   
  FieldDescriptorProto.Type,
   
  | FieldDescriptorProto.Type.TYPE_MESSAGE
  | FieldDescriptorProto.Type.TYPE_ENUM
  | FieldDescriptorProto.Type.TYPE_GROUP
>;

export type ProtoScalarType =
  typeof protoScalarByFieldDescriptorType[FieldDescriptorScalarType];
export type ProtoScalar = {
  kind: "Scalar";
  type: ProtoScalarType;
};

const protoScalarByFieldDescriptorType = {
  [FieldDescriptorProto.Type.TYPE_DOUBLE]: "double",
  [FieldDescriptorProto.Type.TYPE_FLOAT]: "float",
  [FieldDescriptorProto.Type.TYPE_INT32]: "int32",
  [FieldDescriptorProto.Type.TYPE_INT64]: "int64",
  [FieldDescriptorProto.Type.TYPE_UINT32]: "uint32",
  [FieldDescriptorProto.Type.TYPE_UINT64]: "uint64",
  [FieldDescriptorProto.Type.TYPE_SINT32]: "sint32",
  [FieldDescriptorProto.Type.TYPE_SINT64]: "sint64",
  [FieldDescriptorProto.Type.TYPE_FIXED32]: "fixed32",
  [FieldDescriptorProto.Type.TYPE_FIXED64]: "fixed64",
  [FieldDescriptorProto.Type.TYPE_SFIXED32]: "sfixed32",
  [FieldDescriptorProto.Type.TYPE_SFIXED64]: "sfixed64",
  [FieldDescriptorProto.Type.TYPE_BOOL]: "bool",
  [FieldDescriptorProto.Type.TYPE_STRING]: "string",
  [FieldDescriptorProto.Type.TYPE_BYTES]: "bytes",
   
} as const satisfies Record<FieldDescriptorScalarType, string>;

export function getScalarTypeFromDescriptor(
  desc: FieldDescriptorProto
): ProtoScalarType | undefined {
  const t = desc.getType();
  if (t === undefined) return undefined;

  return (
    protoScalarByFieldDescriptorType[t as FieldDescriptorScalarType] ??
    undefined
  );
}
