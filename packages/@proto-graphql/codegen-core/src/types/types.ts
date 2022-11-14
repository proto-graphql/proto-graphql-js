import { ProtoEnum, ProtoField, ProtoMessage, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import assert from "assert";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { DslFile } from "./DslFile";
import { EnumType } from "./EnumType";
import { InputObjectType } from "./InputObjectType";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import {
  exceptRequestOrResponse,
  GenerationParams,
  isIgnoredField,
  isIgnoredType,
  isInterface,
  isScalar,
  isSquashedUnion,
} from "./util";

export type GlType =
  | ScalarType
  | ObjectType
  | InterfaceType
  | OneofUnionType
  | SquashedOneofUnionType
  | EnumType
  | InputObjectType;

export function collectTypesFromFile(file: DslFile, registry: ProtoRegistry) {
  const [msgs, enums] = file.proto.collectTypesRecursively();

  return [
    ...buildObjectTypes(msgs, file, registry),
    ...buildInputObjectTypes(msgs, file, registry),
    ...buildInterfaceType(msgs, file, registry),
    ...buildSquashedOneofUnionTypes(msgs, file),
    ...buildOneofUnionTypes(msgs, file),
    ...buildEnumTypes(enums, file),
  ];
}

function buildObjectTypes(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): ObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => !isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new ObjectType(m, file));
}

function buildInputObjectTypes(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): InputObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InputObjectType(m, file))
    .flatMap((t) => (file.options.partialInputs && t.hasPartialInput() ? [t, t.toPartialInput()] : t));
}

function buildInterfaceType(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): InterfaceType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InterfaceType(m, file));
}

function buildSquashedOneofUnionTypes(msgs: ProtoMessage[], file: DslFile): SquashedOneofUnionType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => isSquashedUnion(m))
    .map((m) => new SquashedOneofUnionType(m, file));
}

function buildOneofUnionTypes(msgs: ProtoMessage[], file: DslFile): OneofUnionType[] {
  return msgs
    .filter((m) => !isSquashedUnion(m))
    .flatMap((m) => m.oneofs)
    .filter((o) => !isIgnoredField(o))
    .map((o) => new OneofUnionType(o, file));
}

function buildEnumTypes(enums: ProtoEnum[], file: DslFile): EnumType[] {
  return enums.filter((e) => !isIgnoredType(e)).map((e) => new EnumType(e, file));
}

export function getObjectFieldType(
  proto: ProtoField,
  opts: GenerationParams & { dsl: "nexus" | "pothos" }
): ScalarType | EnumType | ObjectType | InterfaceType | SquashedOneofUnionType {
  return detectType<ObjectType | InterfaceType | SquashedOneofUnionType | ScalarType>(proto, opts, (msg, file) => {
    if (isInterface(msg)) return new InterfaceType(msg, file);
    if (isSquashedUnion(msg)) return new SquashedOneofUnionType(msg, file);
    return new ObjectType(msg, file);
  });
}

export function getInputObjectFieldType(
  proto: ProtoField,
  opts: GenerationParams & { dsl: "nexus" | "pothos" }
): ScalarType | EnumType | InputObjectType {
  return detectType<InputObjectType>(proto, opts, (msg, file) => {
    return new InputObjectType(msg, file);
  });
}

function detectType<T extends ObjectType | InterfaceType | SquashedOneofUnionType | InputObjectType | ScalarType>(
  proto: ProtoField,
  opts: GenerationParams & { dsl: "nexus" | "pothos" },
  f: (msg: ProtoMessage, file: DslFile) => T
): ScalarType | EnumType | T {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const pbtype = proto.descriptor.getType()!;
  switch (pbtype) {
    case FieldDescriptorProto.Type.TYPE_STRING:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_DOUBLE:
    case FieldDescriptorProto.Type.TYPE_FLOAT:
      return new ScalarType(proto, "Float", opts);
    case FieldDescriptorProto.Type.TYPE_INT64:
      return new ScalarType(proto, opts.longNumber, opts);
    case FieldDescriptorProto.Type.TYPE_UINT64:
      return new ScalarType(proto, opts.longNumber, opts);
    case FieldDescriptorProto.Type.TYPE_INT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_FIXED64:
      return new ScalarType(proto, opts.longNumber, opts);
    case FieldDescriptorProto.Type.TYPE_FIXED32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_UINT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SFIXED32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SFIXED64:
      return new ScalarType(proto, opts.longNumber, opts);
    case FieldDescriptorProto.Type.TYPE_SINT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SINT64:
      return new ScalarType(proto, opts.longNumber, opts);
    case FieldDescriptorProto.Type.TYPE_BOOL:
      return new ScalarType(proto, "Boolean", opts);
    case FieldDescriptorProto.Type.TYPE_GROUP:
      throw "not supported";
    case FieldDescriptorProto.Type.TYPE_BYTES:
      throw "not supported";
    case FieldDescriptorProto.Type.TYPE_ENUM:
      assert(proto.type && proto.type.kind === "Enum");
      return new EnumType(proto.type, new DslFile(proto.type.file, opts));
    case FieldDescriptorProto.Type.TYPE_MESSAGE: {
      assert(proto.type && proto.type.kind === "Message");
      const msg = proto.type;
      if (isScalar(msg, opts)) {
        return new ScalarType(proto, opts.typeMappings[msg.fullName.toString()] as any, opts);
      }
      const file = new DslFile(msg.file, opts);
      return f(msg, file);
    }
    /* istanbul ignore next */
    default: // eslint-disable-line
      const _exhaustiveCheck: never = pbtype;
      throw "unreachable";
  }
}
