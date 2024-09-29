import {
  type DescField,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";
import {
  isEnumField,
  isMapField,
  isMessageField,
  isScalarField,
} from "../proto/util.js";

export type GqlScalarType =
  | "Int"
  | "Float"
  | "String"
  | "Boolean"
  | "ID"
  | "DateTime"
  | (string & {});

export class ScalarType {
  constructor(
    private readonly proto: DescField,
    private readonly type: GqlScalarType,
  ) {}

  get typeName(): string {
    return this.type;
  }

  public isPrimitive(): boolean {
    return isScalarField(this.proto);
  }

  public isWrapperType(): boolean {
    return (
      isMessageField(this.proto) &&
      this.proto.message.file.name === "google/protobuf/wrappers"
    );
  }

  public isInt(): boolean {
    return this.typeName === "Int";
  }

  public isString(): boolean {
    return this.typeName === "String";
  }

  public isCustomScalar(): boolean {
    return !this.isPrimitive() && !this.isPrimitive();
  }

  public is64bitInt(): boolean {
    if (isMessageField(this.proto)) {
      return (
        this.proto.message.typeName === "google.protobuf.Int64Value" ||
        this.proto.message.typeName === "google.protobuf.UInt64Value"
      );
    }
    if (isScalarField(this.proto)) {
      return (
        this.proto.scalar === ProtoScalarType.INT64 ||
        this.proto.scalar === ProtoScalarType.UINT64 ||
        this.proto.scalar === ProtoScalarType.SINT64 ||
        this.proto.scalar === ProtoScalarType.FIXED64 ||
        this.proto.scalar === ProtoScalarType.SFIXED64
      );
    }
    if (isEnumField(this.proto) || isMapField(this.proto)) {
      return false;
    }
    this.proto satisfies never;
    return false;
  }

  public isBytes(): boolean {
    if (isMessageField(this.proto)) {
      return this.proto.message.typeName === "google.protobuf.BytesValue";
    }
    if (isScalarField(this.proto)) {
      return this.proto.scalar === ProtoScalarType.BYTES;
    }
    if (isEnumField(this.proto) || isMapField(this.proto)) {
      return false;
    }
    this.proto satisfies never;
    return false;
  }
}
