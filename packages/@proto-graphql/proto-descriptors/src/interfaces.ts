import {
  DescriptorProto,
  EnumDescriptorProto,
  EnumValueDescriptorProto,
  FieldDescriptorProto,
  FileDescriptorProto,
  MethodDescriptorProto,
  OneofDescriptorProto,
  ServiceDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";

import type { ProtoScalar, ProtoScalarType } from "./scalars";

export interface FullName {
  parent: FullName | null;
  name: string;
  toString(): string;
}

const protoKinds = [
  "File",
  "Service",
  "Method",
  "Message",
  "Oneof",
  "Field",
  "Enum",
  "EnumValue",
] as const;
export type ProtoKind = (typeof protoKinds)[number];

const descriptorByKind = {
  File: FileDescriptorProto,
  Service: ServiceDescriptorProto,
  Method: MethodDescriptorProto,
  Message: DescriptorProto,
  Oneof: OneofDescriptorProto,
  Field: FieldDescriptorProto,
  Enum: EnumDescriptorProto,
  EnumValue: EnumValueDescriptorProto,
};
export type Descriptor<K extends ProtoKind> = InstanceType<
  (typeof descriptorByKind)[K]
>;

export type { ProtoScalar, ProtoScalarType };

export interface ProtoBase<K extends ProtoKind> {
  readonly kind: K;
  readonly descriptor: Descriptor<K>;
}

export interface ProtoFile extends ProtoBase<"File"> {
  /**
   * @example `google/protobuf/wrappers.proto`
   */
  readonly name: string;
  /**
   * @example `google.protobuf`
   */
  readonly fullName: FullName;
  /**
   * @example `google.protobuf`
   */
  readonly package: string;
  readonly messages: ProtoMessage[];
  readonly enums: ProtoEnum[];
  readonly services: ProtoService[];
  readonly deprecated: boolean;
  collectTypesRecursively(): [ProtoMessage[], ProtoEnum[]];
}

export interface ProtoService extends ProtoBase<"Service"> {
  /**
   * @example `Bigtable`
   */
  readonly name: string;
  /**
   * @example `google.bigtable.v2.Bigtable`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly file: ProtoFile;
  readonly parent: ProtoFile;
  readonly methods: ProtoMethod[];
  readonly deprecated: boolean;
}

export interface ProtoMethod extends ProtoBase<"Method"> {
  /**
   * @example `ReadRows`
   */
  readonly name: string;
  /**
   * @example `google.bigtable.v2.Bigtable.ReadRows`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly input: ProtoMessage;
  readonly output: ProtoMessage;
  readonly parent: ProtoService;
  readonly deprecated: boolean;
}

export interface ProtoMessage extends ProtoBase<"Message"> {
  /**
   * @example `RowRange`
   */
  readonly name: string;
  /**
   * @example `google.bigtable.v2.RowRange`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly file: ProtoFile;
  readonly parent: ProtoFile | ProtoMessage;
  readonly fields: ProtoField[];
  readonly oneofs: ProtoOneof[];
  readonly messages: ProtoMessage[];
  readonly enums: ProtoEnum[];
  readonly comments: CommentSet;
  readonly deprecated: boolean;
}

export interface ProtoOneof extends ProtoBase<"Oneof"> {
  /**
   * @example `start_key`
   */
  readonly name: string;
  /**
   * @example `google.bigtable.v2.RowRange.start_key`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly file: ProtoFile;
  readonly parent: ProtoMessage;
  readonly fields: ProtoField[];
  readonly comments: CommentSet;
  readonly deprecated: boolean;
  /**
   * return true if this is synthetic oneof for backward compat for proto3 optional.
   * @see https://github.com/protocolbuffers/protobuf/blob/v21.12/docs/implementing_proto3_presence.md#updating-a-code-generator
   */
  readonly synthetic: boolean;
}

export interface ProtoField extends ProtoBase<"Field"> {
  /**
   * @example `timestamp_micros`
   */
  readonly name: string;
  /**
   * @example `google.bigtable.v2.Cell.timestamp_micros`
   */
  readonly fullName: FullName;
  /**
   * @example `timestampMicros`
   */
  readonly jsonName: string;
  readonly index: number;
  readonly number: number;
  readonly parent: ProtoMessage;
  readonly type: ProtoMessage | ProtoEnum | ProtoScalar;
  readonly containingOneof: ProtoOneof | null;
  readonly list: boolean;
  readonly optional: boolean;
  readonly comments: CommentSet;
  readonly deprecated: boolean;
}

export interface ProtoEnum extends ProtoBase<"Enum"> {
  /**
   * @example `Month`
   */
  readonly name: string;
  /**
   * @example `google.type.Month`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly file: ProtoFile;
  readonly parent: ProtoFile | ProtoMessage;
  readonly values: ProtoEnumValue[];
  readonly comments: CommentSet;
  readonly deprecated: boolean;
}

export interface ProtoEnumValue extends ProtoBase<"EnumValue"> {
  /**
   * @example `JANUARY`
   */
  readonly name: string;
  /**
   * @example `google.type.JANUARY`
   */
  readonly fullName: FullName;
  readonly index: number;
  readonly parent: ProtoEnum;
  readonly number: number;
  readonly comments: CommentSet;
  readonly deprecated: boolean;
}

export interface CommentSet {
  readonly leadingDetachedComments: string[];
  readonly leadingComments: string;
  readonly trailingComments: string;
}
