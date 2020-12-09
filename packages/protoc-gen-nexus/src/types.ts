import {
  FieldDescriptorProto,
  DescriptorProto,
  SourceCodeInfo,
  FileDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";

export class Message {
  private readonly fd: FileDescriptorProto;
  private readonly d: DescriptorProto;
  private readonly importPrefix: string;
  public readonly fields: Field[];
  private comments?: Comments;

  constructor(
    fd: FileDescriptorProto,
    d: DescriptorProto,
    params: { importPrefix?: string }
  ) {
    this.d = d;
    this.fd = fd;
    this.fields = d.getFieldList()!.map((fd) => new Field(fd));
    this.importPrefix = params.importPrefix ?? ".";
  }

  get name(): string {
    return this.d.getName()!;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  get importPath(): string {
    return `${this.importPrefix}/${this.fd
      .getName()!
      .split(".")
      .slice(0, -1)
      .join(".")}`;
  }

  public addSourceCodeInfoLocation(l: SourceCodeInfo.Location) {
    const pathList = l.getPathList();
    const comments = {
      leadingComments: l.getLeadingComments()!.trim(),
      trailingComments: l.getTrailingComments()!.trim(),
      leadingDetachedCommentsList: l
        .getLeadingDetachedCommentsList()!
        .map((s) => s.trim()),
    };
    if (pathList.length === 2) {
      this.comments = comments;
    } else if (pathList[2] === 2) {
      this.fields[pathList[3]].addComments(comments, pathList);
    }
  }
}

export class Field {
  private readonly fd: FieldDescriptorProto;
  public readonly type: Type;
  // https://github.com/protocolbuffers/protobuf/blob/v3.12.3/src/google/protobuf/descriptor.proto#L770
  private comments?: Comments;
  private labelComments?: Comments;
  private typeComments?: Comments;
  private nameComments?: Comments;
  private numberComments?: Comments;

  constructor(fd: FieldDescriptorProto) {
    this.fd = fd;
    this.type = Field.convertType(fd);
  }

  get name(): string {
    return this.fd.getJsonName()!;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  public isNullable(): boolean {
    return !(
      this.fd.getLabel() === FieldDescriptorProto.Label.LABEL_REQUIRED ||
      this.comments?.leadingComments?.startsWith("Required. ")
    );
  }

  public addComments(comments: Comments, pathList: number[]) {
    if (pathList.length === 4) {
      this.comments = comments;
      return;
    }
    switch (pathList[4]) {
      case 4:
        this.labelComments = comments;
        break;
      case 5:
        this.typeComments = comments;
        break;
      case 1:
        this.nameComments = comments;
        break;
      case 3:
        this.numberComments = comments;
        break;
    }
  }

  private static convertType(f: FieldDescriptorProto): Type {
    if (f.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED) {
      return {
        kind: "list",
        type: this.convertItemType(f),
      };
    }

    return this.convertItemType(f);
  }

  private static convertItemType(f: FieldDescriptorProto): ItemType {
    const pbtype = f.getType()!;
    switch (pbtype) {
      case FieldDescriptorProto.Type.TYPE_STRING:
        return { kind: "scalar", type: "String" };
      case FieldDescriptorProto.Type.TYPE_DOUBLE:
      case FieldDescriptorProto.Type.TYPE_FLOAT:
        return { kind: "scalar", type: "Float" };
      case FieldDescriptorProto.Type.TYPE_INT64:
      case FieldDescriptorProto.Type.TYPE_UINT64:
      case FieldDescriptorProto.Type.TYPE_INT32:
      case FieldDescriptorProto.Type.TYPE_FIXED64:
      case FieldDescriptorProto.Type.TYPE_FIXED32:
      case FieldDescriptorProto.Type.TYPE_UINT32:
      case FieldDescriptorProto.Type.TYPE_SFIXED32:
      case FieldDescriptorProto.Type.TYPE_SFIXED64:
      case FieldDescriptorProto.Type.TYPE_SINT32:
      case FieldDescriptorProto.Type.TYPE_SINT64:
        return { kind: "scalar", type: "Int" };
      case FieldDescriptorProto.Type.TYPE_BOOL:
        return { kind: "scalar", type: "Boolean" };
      case FieldDescriptorProto.Type.TYPE_GROUP:
        throw "not supported";
      case FieldDescriptorProto.Type.TYPE_BYTES:
        throw "not supported";
      case FieldDescriptorProto.Type.TYPE_ENUM:
        throw "not implemented";
      case FieldDescriptorProto.Type.TYPE_MESSAGE:
        switch (f.getTypeName()) {
          case ".google.protobuf.Any":
            throw "not supported";
          case ".google.protobuf.BoolValue":
            return {
              kind: "scalar",
              type: "Boolean",
            };
          case ".google.protobuf.BytesValue":
            throw "not supported";
          case ".google.protobuf.DoubleValue":
          case ".google.protobuf.FloatValue":
            return {
              kind: "scalar",
              type: "Float",
            };
          case ".google.protobuf.Duration":
            throw "not implemented";
          case ".google.protobuf.Int32Value":
          case ".google.protobuf.Int64Value":
          case ".google.protobuf.UInt32Value":
          case ".google.protobuf.UInt64Value":
            return {
              kind: "scalar",
              type: "Int",
            };
          case ".google.protobuf.StringValue":
            return {
              kind: "scalar",
              type: "String",
            };
          case ".google.protobuf.Timestamp":
            return {
              kind: "scalar",
              type: "String",
            };
          default:
            return {
              kind: "object",
              // FIXME
              type: f.getTypeName()!.split(".").slice(-1)[0]!,
            };
        }
      default:
        const _exhaustiveCheck: never = pbtype; // eslint-disable-line
        throw "unreachable";
    }
  }
}

interface Comments {
  leadingComments?: string;
  trailingComments?: string;
  leadingDetachedCommentsList?: string[];
}

type ScalarType = "Int" | "Float" | "String" | "Boolean" | "ID";

export type ItemType =
  | {
      kind: "scalar";
      type: ScalarType;
    }
  | {
      kind: "object";
      type: string;
    };

export type Type =
  | ItemType
  | {
      kind: "list";
      type: ItemType;
    };
