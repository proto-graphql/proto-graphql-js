import { ProtoField } from "@proto-graphql/proto-descriptors";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { createProtoFullName, FullName, GenerationParams } from "./util";

export type GqlScalarType = "Int" | "Float" | "String" | "Boolean" | "ID" | "DateTime";

export class ScalarType {
  constructor(
    private readonly proto: ProtoField,
    private readonly type: GqlScalarType,
    private readonly opts: GenerationParams & { dsl: "nexus" | "pothos" }
  ) {}

  get typeName(): string {
    return this.type;
  }

  public isPrimitive(): boolean {
    return this.proto.type == null;
  }

  public isWrapperType(): boolean {
    return this.proto.type != null && this.proto.type.file.name === "google/protobuf/wrappers.proto";
  }

  get importPath(): string | null {
    if (this.opts.dsl === "nexus" && (this.proto.type || this.shouldToString())) {
      return "proto-nexus";
    }
    return null;
  }

  get protoFullName(): string | null {
    if (this.proto.type) {
      return this.proto.type.fullName.toString();
    }
    return null;
  }

  get protoTypeFullName(): FullName | null {
    if (this.proto.type) {
      return createProtoFullName(this.proto.type, this.opts);
    }
    return null;
  }

  public shouldToString(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const pbtype = this.proto.descriptor.getType()!;
    switch (pbtype) {
      case FieldDescriptorProto.Type.TYPE_INT64:
      case FieldDescriptorProto.Type.TYPE_UINT64:
      case FieldDescriptorProto.Type.TYPE_FIXED64:
      case FieldDescriptorProto.Type.TYPE_SFIXED64:
      case FieldDescriptorProto.Type.TYPE_SINT64:
        return true;
      default:
        return false;
    }
  }

  public hasProtobufjsLong(): boolean {
    if (!this.proto.type) return false;
    switch (this.proto.type.fullName.toString()) {
      case "google.protobuf.Int64Value":
      case "google.protobuf.UInt64Value":
      case "google.protobuf.Timestamp":
        return true;
      default:
        return false;
    }
  }
}
