import assert from "assert";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { ProtoField } from "../../protogen";
import { getUnwrapFunc, getWrapFunc, UnwrapFunc, WrapFunc } from "./unwrap";
import { createProtoFullName, FullName, GenerationParams } from "./util";

export type GqlScalarType = "Int" | "Float" | "String" | "Boolean" | "ID" | "DateTime";

export class ScalarType {
  constructor(
    private readonly proto: ProtoField,
    private readonly type: GqlScalarType,
    private readonly opts: GenerationParams
  ) {}

  get typeName(): string {
    return this.type;
  }

  public isPrimitive(): boolean {
    return this.proto.type == null;
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
      case FieldDescriptorProto.Type.TYPE_MESSAGE:
        assert(this.proto.type && this.proto.type.kind === "Message");
        switch (this.proto.type.fullName.toString()) {
          case "google.protobuf.Int64Value":
          case "google.protobuf.UInt64Value":
            return true;
          default:
            return false;
        }
      default:
        return false;
    }
  }

  get wrapFunc(): WrapFunc | null {
    return getWrapFunc(this.proto, this.opts);
  }

  get unwrapFunc(): UnwrapFunc | null {
    return getUnwrapFunc(this.proto, this.opts);
  }
}
