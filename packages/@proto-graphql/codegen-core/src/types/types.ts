import {
  DescFile,
  DescMessage,
  DescField,
  DescEnum,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";

import { EnumType } from "./EnumType";
import { InputObjectType } from "./InputObjectType";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import { TypeOptions } from "./options";
import {
  exceptRequestOrResponse,
  isIgnoredField,
  isIgnoredInputType,
  isIgnoredType,
  isInterface,
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
  file: DescFile,
  options: TypeOptions,
  files: readonly DescFile[],
) {
  const [msgs, enums] = collectDescsRecursively({
    nestedMessages: file.messages,
    nestedEnums: file.enums,
  });

  return [
    ...buildObjectTypes(msgs, options, files),
    ...buildInputObjectTypes(msgs, options, files),
    ...buildInterfaceType(msgs, options, files),
    ...buildSquashedOneofUnionTypes(msgs, options),
    ...buildOneofUnionTypes(msgs, options),
    ...buildEnumTypes(enums, options),
  ];
}

function collectDescsRecursively({
  nestedMessages,
  nestedEnums,
}: {
  nestedMessages: DescMessage[];
  nestedEnums: DescEnum[];
}): [DescMessage[], DescEnum[]] {
  const foundMsgs: DescMessage[] = [...nestedMessages];
  const foundEnums: DescEnum[] = [...nestedEnums];

  for (const msg of nestedMessages) {
    const [childMsgs, childEnums] = collectDescsRecursively(msg);
    foundMsgs.push(...childMsgs);
    foundEnums.push(...childEnums);
  }

  return [foundMsgs, foundEnums];
}

function buildObjectTypes(
  msgs: DescMessage[],
  options: TypeOptions,
  files: readonly DescFile[],
): ObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => !isInterface(m))
    .filter(exceptRequestOrResponse(files))
    .map((m) => new ObjectType(m, options));
}

function buildInputObjectTypes(
  msgs: DescMessage[],
  options: TypeOptions,
  files: readonly DescFile[],
): InputObjectType[] {
  return msgs
    .filter((m) => !isIgnoredInputType(m))
    .filter(exceptRequestOrResponse(files))
    .map((m) => new InputObjectType(m, options))
    .flatMap((t) =>
      options.partialInputs && t.hasPartialInput()
        ? [t, t.toPartialInput()]
        : t,
    );
}

function buildInterfaceType(
  msgs: DescMessage[],
  options: TypeOptions,
  files: readonly DescFile[],
): InterfaceType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => isInterface(m))
    .filter(exceptRequestOrResponse(files))
    .map((m) => new InterfaceType(m, options));
}

function buildSquashedOneofUnionTypes(
  msgs: DescMessage[],
  options: TypeOptions,
): SquashedOneofUnionType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => isSquashedUnion(m))
    .map((m) => new SquashedOneofUnionType(m, options));
}

function buildOneofUnionTypes(
  msgs: DescMessage[],
  options: TypeOptions,
): OneofUnionType[] {
  return msgs
    .filter((m) => !isSquashedUnion(m))
    .flatMap((m) => m.oneofs)
    .filter((o) => !isIgnoredField(o))
    .map((o) => new OneofUnionType(o, options));
}

function buildEnumTypes(enums: DescEnum[], options: TypeOptions): EnumType[] {
  return enums
    .filter((e) => !isIgnoredType(e))
    .map((e) => new EnumType(e, options));
}

export function getObjectFieldType(
  proto: DescField,
  options: TypeOptions,
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
  proto: DescField,
  options: TypeOptions,
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
    | ScalarType,
>(
  desc: DescField,
  options: TypeOptions,
  f: (msg: DescMessage, options: TypeOptions) => T,
): ScalarType | EnumType | T {
  switch (desc.fieldKind) {
    case "message": {
      const customScalar = options.scalarMapping[desc.message.typeName];
      if (customScalar) return new ScalarType(desc, customScalar);
      return f(desc.message, options);
    }
    case "enum": {
      return new EnumType(desc.enum, options);
    }
    case "scalar": {
      return new ScalarType(
        desc,
        options.scalarMapping[scalarMapLabelByType[desc.scalar]],
      );
    }
    case "map": {
      throw new Error("map type is not supported");
    }
    /* istanbul ignore next */
    default: {
      const _exhaustiveCheck: never = desc;
      throw "unreachable";
    }
  }
}

export const scalarMapLabelByType: Record<ProtoScalarType, string> = {
  [ProtoScalarType.DOUBLE]: "double",
  [ProtoScalarType.FLOAT]: "float",
  [ProtoScalarType.INT64]: "int64",
  [ProtoScalarType.UINT64]: "uint64",
  [ProtoScalarType.INT32]: "int32",
  [ProtoScalarType.FIXED64]: "fixed64",
  [ProtoScalarType.FIXED32]: "fixed32",
  [ProtoScalarType.BOOL]: "bool",
  [ProtoScalarType.STRING]: "string",
  [ProtoScalarType.BYTES]: "bytes",
  [ProtoScalarType.UINT32]: "uint32",
  [ProtoScalarType.SFIXED32]: "sfixed32",
  [ProtoScalarType.SFIXED64]: "sfixed64",
  [ProtoScalarType.SINT32]: "sint32",
  [ProtoScalarType.SINT64]: "sint64",
};
