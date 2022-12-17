import {
  ProtoEnum,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoRegistry,
} from "@proto-graphql/proto-descriptors";
import assert from "assert";
import { EnumType } from "./EnumType";
import { InputObjectType } from "./InputObjectType";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeOptions } from "./options";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import {
  exceptRequestOrResponse,
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

export function collectTypesFromFile(
  file: ProtoFile,
  options: TypeOptions,
  registry: ProtoRegistry
) {
  const [msgs, enums] = file.collectTypesRecursively();

  return [
    ...buildObjectTypes(msgs, options, registry),
    ...buildInputObjectTypes(msgs, options, registry),
    ...buildInterfaceType(msgs, options, registry),
    ...buildSquashedOneofUnionTypes(msgs, options),
    ...buildOneofUnionTypes(msgs, options),
    ...buildEnumTypes(enums, options),
  ];
}

function buildObjectTypes(
  msgs: ProtoMessage[],
  options: TypeOptions,
  registry: ProtoRegistry
): ObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => !isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new ObjectType(m, options));
}

function buildInputObjectTypes(
  msgs: ProtoMessage[],
  options: TypeOptions,
  registry: ProtoRegistry
): InputObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InputObjectType(m, options))
    .flatMap((t) =>
      options.partialInputs && t.hasPartialInput() ? [t, t.toPartialInput()] : t
    );
}

function buildInterfaceType(
  msgs: ProtoMessage[],
  options: TypeOptions,
  registry: ProtoRegistry
): InterfaceType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InterfaceType(m, options));
}

function buildSquashedOneofUnionTypes(
  msgs: ProtoMessage[],
  options: TypeOptions
): SquashedOneofUnionType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => isSquashedUnion(m))
    .map((m) => new SquashedOneofUnionType(m, options));
}

function buildOneofUnionTypes(
  msgs: ProtoMessage[],
  options: TypeOptions
): OneofUnionType[] {
  return msgs
    .filter((m) => !isSquashedUnion(m))
    .flatMap((m) => m.oneofs)
    .filter((o) => !isIgnoredField(o))
    .map((o) => new OneofUnionType(o, options));
}

function buildEnumTypes(enums: ProtoEnum[], options: TypeOptions): EnumType[] {
  return enums
    .filter((e) => !isIgnoredType(e))
    .map((e) => new EnumType(e, options));
}

export function getObjectFieldType(
  proto: ProtoField,
  options: TypeOptions
): ScalarType | EnumType | ObjectType | InterfaceType | SquashedOneofUnionType {
  return detectType<
    ObjectType | InterfaceType | SquashedOneofUnionType | ScalarType
  >(proto, options, (msg, file) => {
    if (isInterface(msg)) return new InterfaceType(msg, file);
    if (isSquashedUnion(msg)) return new SquashedOneofUnionType(msg, file);
    return new ObjectType(msg, file);
  });
}

export function getInputObjectFieldType(
  proto: ProtoField,
  options: TypeOptions
): ScalarType | EnumType | InputObjectType {
  return detectType<InputObjectType>(proto, options, (msg, file) => {
    return new InputObjectType(msg, file);
  });
}

function detectType<
  T extends
    | ObjectType
    | InterfaceType
    | SquashedOneofUnionType
    | InputObjectType
    | ScalarType
>(
  proto: ProtoField,
  options: TypeOptions,
  f: (msg: ProtoMessage, options: TypeOptions) => T
): ScalarType | EnumType | T {
  if (proto.type === null) {
    throw new Error(
      `unsupported field type in proto(name: ${proto.fullName.toString()}, type: ${proto.descriptor.getType()})`
    );
  }
  switch (proto.type.kind) {
    case "Message": {
      assert(proto.type && proto.type.kind === "Message");
      const msg = proto.type;
      if (isScalar(msg, options)) {
        return new ScalarType(
          proto,
          options.typeMappings[msg.fullName.toString()] as any
        );
      }
      return f(msg, options);
    }
    case "Enum": {
      assert(proto.type && proto.type.kind === "Enum");
      return new EnumType(proto.type, options);
    }
    case "Scalar": {
      switch (proto.type.type) {
        case "string":
          return new ScalarType(proto, "String");
        case "double":
        case "float":
          return new ScalarType(proto, "Float");
        case "int64":
          return new ScalarType(proto, options.longNumber);
        case "uint64":
          return new ScalarType(proto, options.longNumber);
        case "int32":
          return new ScalarType(proto, "Int");
        case "fixed64":
          return new ScalarType(proto, options.longNumber);
        case "fixed32":
          return new ScalarType(proto, "Int");
        case "uint32":
          return new ScalarType(proto, "Int");
        case "sfixed32":
          return new ScalarType(proto, "Int");
        case "sfixed64":
          return new ScalarType(proto, options.longNumber);
        case "sint32":
          return new ScalarType(proto, "Int");
        case "sint64":
          return new ScalarType(proto, options.longNumber);
        case "bool":
          return new ScalarType(proto, "Boolean");
        case "bytes":
          throw "not supported";
        /* istanbul ignore next */
        default: {
          const _exhaustiveCheck: never = proto.type.type;
          throw "unreachable";
        }
      }
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = proto.type;
      throw "unreachable";
    }
  }
}
