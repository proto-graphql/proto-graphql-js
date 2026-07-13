import {
  type DescEnum,
  type DescField,
  type DescFile,
  type DescMessage,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";

import {
  isEnumField,
  isMapField,
  isMessageField,
  isScalarField,
} from "../proto/util.js";
import { EnumType } from "./EnumType.js";
import { InputObjectType } from "./InputObjectType.js";
import { InterfaceType } from "./InterfaceType.js";
import { ObjectType } from "./ObjectType.js";
import { OneofUnionType } from "./OneofUnionType.js";
import type { TypeOptions } from "./options.js";
import { ScalarType } from "./ScalarType.js";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType.js";
import {
  exceptRequestOrResponse,
  isIgnoredField,
  isIgnoredInputType,
  isIgnoredType,
  isInterface,
  isRequestAsInputOnly,
  isResponseAsPayloadOnly,
  isSquashedUnion,
} from "./util.js";

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
  // `files` carries the request/response matching context that
  // `requests_as_inputs` / `responses_as_payloads` need (see `TypeOptions.files`).
  // Merging it in here, once, means every type instance built below — and
  // every type reached transitively through their fields — resolves names
  // through the same `options` object, so a transformed name is visible
  // wherever it's referenced.
  const opts: TypeOptions = { ...options, files };

  const [msgs, enums] = collectDescsRecursively({
    nestedMessages: file.messages,
    nestedEnums: file.enums,
  });

  return [
    ...buildObjectTypes(msgs, opts, files),
    ...buildInputObjectTypes(msgs, opts, files),
    ...buildInterfaceType(msgs, opts, files),
    ...buildSquashedOneofUnionTypes(msgs, opts),
    ...buildOneofUnionTypes(msgs, opts),
    ...buildEnumTypes(enums, opts),
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
  return (
    msgs
      .filter((m) => !isIgnoredType(m))
      .filter((m) => !isSquashedUnion(m))
      .filter((m) => !isInterface(m))
      .filter(exceptRequestOrResponse(files))
      // requests_as_inputs: a matched request generates only its Input type.
      .filter((m) => !isRequestAsInputOnly(m, files))
      .map((m) => new ObjectType(m, options))
  );
}

function buildInputObjectTypes(
  msgs: DescMessage[],
  options: TypeOptions,
  files: readonly DescFile[],
): InputObjectType[] {
  return (
    msgs
      .filter((m) => !isIgnoredInputType(m))
      .filter(exceptRequestOrResponse(files))
      // responses_as_payloads: a matched response generates only its Object
      // type (no Input, no partial Input).
      .filter((m) => !isResponseAsPayloadOnly(m, files))
      .map((m) => new InputObjectType(m, options))
      .flatMap((t) =>
        options.partialInputs && t.hasPartialInput()
          ? [t, t.toPartialInput()]
          : t,
      )
  );
}

function buildInterfaceType(
  msgs: DescMessage[],
  options: TypeOptions,
  files: readonly DescFile[],
): InterfaceType[] {
  return (
    msgs
      .filter((m) => !isIgnoredType(m))
      .filter((m) => !isSquashedUnion(m))
      .filter((m) => isInterface(m))
      .filter(exceptRequestOrResponse(files))
      // requests_as_inputs: a matched request generates only its Input type,
      // even if it's also marked as a GraphQL interface.
      .filter((m) => !isRequestAsInputOnly(m, files))
      .map((m) => new InterfaceType(m, options))
  );
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
  if (isMessageField(desc)) {
    const customScalar = options.scalarMapping[desc.message.typeName];
    if (customScalar) return new ScalarType(desc, customScalar);
    return f(desc.message, options);
  }
  if (isEnumField(desc)) {
    return new EnumType(desc.enum, options);
  }
  if (isScalarField(desc)) {
    return new ScalarType(
      desc,
      options.scalarMapping[scalarMapLabelByType[desc.scalar]],
    );
  }
  if (isMapField(desc)) {
    throw new Error("map type is not supported");
  }

  /* istanbul ignore next */
  desc satisfies never;
  throw "unreachable";
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
