import {
  type DescField,
  ScalarType as ProtoScalarType,
} from "@bufbuild/protobuf";

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
    return this.proto.fieldKind === "scalar";
  }

  public isWrapperType(): boolean {
    return (
      this.proto.fieldKind === "message" &&
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
    switch (this.proto.fieldKind) {
      case "scalar":
        return (
          this.proto.scalar === ProtoScalarType.INT64 ||
          this.proto.scalar === ProtoScalarType.UINT64 ||
          this.proto.scalar === ProtoScalarType.SINT64 ||
          this.proto.scalar === ProtoScalarType.FIXED64 ||
          this.proto.scalar === ProtoScalarType.SFIXED64
        );
      case "message":
        return (
          this.proto.message.typeName === "google.protobuf.Int64Value" ||
          this.proto.message.typeName === "google.protobuf.UInt64Value"
        );
      case "enum":
      case "map":
        return false;
      default: {
        this.proto satisfies never;
        return false;
      }
    }
  }

  public isBytes(): boolean {
    switch (this.proto.fieldKind) {
      case "scalar":
        return this.proto.scalar === ProtoScalarType.BYTES;
      case "message":
        return this.proto.message.typeName === "google.protobuf.BytesValue";
      case "enum":
      case "map":
        return false;
      default: {
        this.proto satisfies never;
        return false;
      }
    }
  }
}
