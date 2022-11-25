import { ProtoEnum, ProtoField, ProtoMessage, ProtoRegistry } from "@proto-graphql/proto-descriptors";
import assert from "assert";
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
  if (proto.type === null) {
    throw new Error(
      `unsupported field type in proto(name: ${proto.fullName.toString()}, type: ${proto.descriptor.getType()})`
    );
  }
  switch (proto.type.kind) {
    case "Message": {
      assert(proto.type && proto.type.kind === "Message");
      const msg = proto.type;
      if (isScalar(msg, opts)) {
        return new ScalarType(proto, opts.typeMappings[msg.fullName.toString()] as any, opts);
      }
      const file = new DslFile(msg.file, opts);
      return f(msg, file);
    }
    case "Enum": {
      assert(proto.type && proto.type.kind === "Enum");
      return new EnumType(proto.type, new DslFile(proto.type.file, opts));
    }
    case "Scalar": {
      switch (proto.type.type) {
        case "string":
          return new ScalarType(proto, "String", opts);
        case "double":
        case "float":
          return new ScalarType(proto, "Float", opts);
        case "int64":
          return new ScalarType(proto, opts.longNumber, opts);
        case "uint64":
          return new ScalarType(proto, opts.longNumber, opts);
        case "int32":
          return new ScalarType(proto, "Int", opts);
        case "fixed64":
          return new ScalarType(proto, opts.longNumber, opts);
        case "fixed32":
          return new ScalarType(proto, "Int", opts);
        case "uint32":
          return new ScalarType(proto, "Int", opts);
        case "sfixed32":
          return new ScalarType(proto, "Int", opts);
        case "sfixed64":
          return new ScalarType(proto, opts.longNumber, opts);
        case "sint32":
          return new ScalarType(proto, "Int", opts);
        case "sint64":
          return new ScalarType(proto, opts.longNumber, opts);
        case "bool":
          return new ScalarType(proto, "Boolean", opts);
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
