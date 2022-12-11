import { ProtoField } from "@proto-graphql/proto-descriptors";

// eslint-disable-next-line @typescript-eslint/ban-types
export type GqlScalarType = "Int" | "Float" | "String" | "Boolean" | "ID" | "DateTime" | (string & {});

export class ScalarType {
  constructor(private readonly proto: ProtoField, private readonly type: GqlScalarType) {}

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
}
