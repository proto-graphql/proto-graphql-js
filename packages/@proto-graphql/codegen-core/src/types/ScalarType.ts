import { DescField, ScalarType as ProtoScalarType } from "@bufbuild/protobuf";

export type GqlScalarType =
  | "Int"
  | "Float"
  | "String"
  | "Boolean"
  | "ID"
  | "DateTime"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});

export class ScalarType {
  constructor(
    private readonly proto: DescField,
    private readonly type: GqlScalarType
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
      this.proto.message.file.name === "google/protobuf/wrappers.proto"
    );
  }

  public isCustomScalar(): boolean {
    return !this.isPrimitive() && !this.isPrimitive();
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
