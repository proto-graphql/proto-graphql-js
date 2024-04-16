import { ProtoField } from "@proto-graphql/proto-descriptors";

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
  public readonly isBytes: boolean;

  constructor(
    private readonly proto: ProtoField,
    private readonly type: GqlScalarType,
    { isBytes = false }: { isBytes?: boolean } = {}
  ) {
    this.isBytes = isBytes;
  }

  get typeName(): string {
    return this.type;
  }

  public isPrimitive(): boolean {
    return this.proto.type == null || this.proto.type.kind === "Scalar";
  }

  public isWrapperType(): boolean {
    return (
      this.proto.type != null &&
      this.proto.type.kind !== "Scalar" &&
      this.proto.type.file.name === "google/protobuf/wrappers.proto"
    );
  }

  public isCustomScalar(): boolean {
    return !this.isPrimitive() && !this.isPrimitive();
  }
}
