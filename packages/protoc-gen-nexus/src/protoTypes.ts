import {
  FieldDescriptorProto,
  DescriptorProto,
  SourceCodeInfo,
  FileDescriptorProto,
  EnumDescriptorProto,
  EnumValueDescriptorProto,
  OneofDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";

export class ProtoRegistry {
  private files: Record<string, ProtoFile>;
  private types: Record<string, ProtoMessage | ProtoEnum>;

  constructor() {
    this.types = {};
    this.files = {};
  }

  public findFile(name: string): ProtoFile {
    return this.files[name];
  }

  public findByFieldDescriptor(
    desc: FieldDescriptorProto
  ): ProtoMessage | ProtoEnum {
    return this.types[desc.getTypeName()!.replace(/^\./, "")];
  }

  public addFile(fd: FileDescriptorProto) {
    const file = new ProtoFile(fd, this);
    this.files[fd.getName()!] = file;

    const [msgs, enums] = this.collectTypes(file);
    for (const m of msgs) {
      this.types[m.qualifiedName] = m;
    }
    for (const e of enums) {
      this.types[e.qualifiedName] = e;
    }
  }

  public collectTypes(file: ProtoFile): [ProtoMessage[], ProtoEnum[]] {
    const [msgs, enums] = [file.messages, file.enums];
    const [childMsgs, childEnums] = this.collectTypesFromMessage(file.messages);
    msgs.push(...childMsgs);
    enums.push(...childEnums);
    return [msgs, enums];
  }

  private collectTypesFromMessage(
    inputs: ProtoMessage[]
  ): [ProtoMessage[], ProtoEnum[]] {
    const msgs: ProtoMessage[] = [];
    const enums: ProtoEnum[] = [];

    for (const input of inputs) {
      const [childMsgs, childEnums] = this.collectTypesFromMessage(
        input.messages
      );
      msgs.push(...input.messages, ...childMsgs);
      enums.push(...input.enums, ...childEnums);
    }

    return [msgs, enums];
  }
}

export class ProtoFile {
  constructor(
    readonly descriptor: FileDescriptorProto,
    readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  get importPath(): string {
    return `${this.name!.split(".").slice(0, -1).join(".")}_pb`;
  }

  get messages(): ProtoMessage[] {
    return this.descriptor
      .getMessageTypeList()
      .map((d, i) => new ProtoMessage(d, this, i));
  }

  get package(): string {
    return this.descriptor.getPackage()!;
  }

  get enums(): ProtoEnum[] {
    return this.descriptor
      .getEnumTypeList()
      .map((d, i) => new ProtoEnum(d, this, i));
  }

  get deprecationReason(): ProtoFile | null {
    return this.descriptor.getOptions()?.getDeprecated() ? this : null;
  }

  public findComments(
    d: ProtoMessage | ProtoOneof | ProtoField | ProtoEnum | ProtoEnumValue
  ): Comments {
    const l = this.findSourceLocation(d);
    if (l === null) return {};
    return {
      leadingComments: l.getLeadingComments()!.trim(),
      trailingComments: l.getTrailingComments()!.trim(),
      leadingDetachedCommentsList: l
        .getLeadingDetachedCommentsList()!
        .map((s) => s.trim()),
    };
  }

  private findSourceLocation(
    d: ProtoMessage | ProtoOneof | ProtoField | ProtoEnum | ProtoEnumValue
  ): SourceCodeInfo.Location | null {
    let paths: number[] = [];
    let desc:
      | ProtoFile
      | ProtoMessage
      | ProtoOneof
      | ProtoField
      | ProtoEnum
      | ProtoEnumValue = d;

    for (;;) {
      if (desc instanceof ProtoFile) {
        paths = paths.reverse();
        return (
          this.descriptor
            .getSourceCodeInfo()
            ?.getLocationList()
            .find(
              (l) =>
                l.getPathList().length === paths.length &&
                l.getPathList().every((v, i) => v === paths[i])
            ) || null
        );
      } else if (desc instanceof ProtoMessage) {
        paths.push(desc.index);
        desc = desc.parent;
        if (desc instanceof ProtoFile) {
          paths.push(4); // FileDescriptorProto.message_type
        } else if (desc instanceof ProtoMessage) {
          paths.push(3); // DescriptorProto.nested_type
        } else {
          const _exhaustiveCheck: never = desc;
        }
      } else if (desc instanceof ProtoOneof) {
        paths.push(desc.index);
        desc = desc.parent;
        paths.push(8); // DescriptorProto.oneof_decl
      } else if (desc instanceof ProtoField) {
        paths.push(desc.index);
        desc = desc.parent;
        paths.push(2); // DescriptorProto.field
      } else if (desc instanceof ProtoEnum) {
        paths.push(desc.index);
        desc = desc.parent;
        if (desc instanceof ProtoFile) {
          paths.push(5); // FileDescriptorProto.enum_type
        } else if (desc instanceof ProtoMessage) {
          paths.push(4); // DescriptorProto.enum_type
        } else {
          const _exhaustiveCheck: never = desc;
        }
      } else if (desc instanceof ProtoEnumValue) {
        paths.push(desc.index);
        desc = desc.parent;
        paths.push(2); // EnumDescriptorProto.value
      } else {
        const _exhaustiveCheck: never = desc;
      }
    }
  }
}

export class ProtoMessage {
  constructor(
    readonly descriptor: DescriptorProto,
    readonly parent: ProtoFile | ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  /**
   * @example "google.protobuf.Field.Kind"
   */
  get qualifiedName(): string {
    return `${
      this.parent instanceof ProtoFile
        ? this.parent.package
        : this.parent.qualifiedName
    }.${this.descriptor.getName()}`;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  get importPath(): string {
    return this.file.importPath;
  }

  get comments(): Comments {
    return this.file.findComments(this);
  }

  get file(): ProtoFile {
    let parent = this.parent;
    for (;;) {
      if (parent instanceof ProtoFile) return parent;
      parent = parent.parent;
    }
  }

  get messages(): ProtoMessage[] {
    return this.descriptor
      .getNestedTypeList()
      .map((d, i) => new ProtoMessage(d, this, i));
  }

  get enums(): ProtoEnum[] {
    return this.descriptor
      .getEnumTypeList()
      .map((d, i) => new ProtoEnum(d, this, i));
  }

  get fields(): ProtoField[] {
    return this.descriptor
      .getFieldList()
      .map((d, i) => new ProtoField(d, this, i));
  }

  get oneofs(): ProtoOneof[] {
    return this.descriptor
      .getOneofDeclList()
      .map((o, i) => new ProtoOneof(o, this, i));
  }

  get deprecationReason(): ProtoFile | ProtoMessage | null {
    return this.descriptor.getOptions()?.getDeprecated()
      ? this
      : this.parent.deprecationReason;
  }
}

export class ProtoOneof {
  constructor(
    readonly descriptor: OneofDescriptorProto,
    readonly parent: ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  get file(): ProtoFile {
    let parent: ProtoFile | ProtoMessage = this.parent;
    for (;;) {
      if (parent instanceof ProtoFile) return parent;
      parent = parent.parent;
    }
  }

  get comments(): Comments {
    return this.file.findComments(this);
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  get fields(): ProtoField[] {
    return this.parent.fields.filter(
      (f): f is NonNullable<ProtoField> =>
        f.descriptor.hasOneofIndex() &&
        f.descriptor.getOneofIndex() === this.index
    );
  }

  get deprecationReason(): ProtoFile | ProtoMessage | ProtoOneof | null {
    return this.fields.every((f) => f.deprecationReason)
      ? this
      : this.parent.deprecationReason;
  }
}

export class ProtoField {
  constructor(
    readonly descriptor: FieldDescriptorProto,
    readonly parent: ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getJsonName()!;
  }

  get getterName(): string {
    const name = this.name;
    let suffix = "";
    if (this.isList()) {
      suffix += "List";
    }
    return `get${name.charAt(0).toUpperCase()}${name.slice(1)}${suffix}`;
  }

  get protoTypeName(): string {
    return this.descriptor.getTypeName()!;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  public isOneofMember(): boolean {
    return this.descriptor.hasOneofIndex();
  }

  public isList(): boolean {
    return (
      this.descriptor.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED
    );
  }

  get comments(): Comments {
    return this.parent.file.findComments(this);
  }

  get type(): ProtoMessage | ProtoEnum | null {
    return this.parent.file.registry.findByFieldDescriptor(this.descriptor);
  }

  get deprecationReason():
    | ProtoFile
    | ProtoMessage
    | ProtoField
    | ProtoEnum
    | null {
    return this.descriptor.getOptions()?.getDeprecated()
      ? this
      : this.type?.deprecationReason || this.parent.deprecationReason;
  }
}

interface Comments {
  leadingComments?: string;
  trailingComments?: string;
  leadingDetachedCommentsList?: string[];
}

export class ProtoEnum {
  constructor(
    readonly descriptor: EnumDescriptorProto,
    readonly parent: ProtoFile | ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  /**
   * @example "google.protobuf.Field.Kind"
   */
  get qualifiedName(): string {
    return `${
      this.parent instanceof ProtoFile
        ? this.parent.package
        : this.parent.qualifiedName
    }.${this.descriptor.getName()}`;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  get comments(): Comments {
    return this.file.findComments(this);
  }

  get file(): ProtoFile {
    let parent = this.parent;
    for (;;) {
      if (parent instanceof ProtoFile) return parent;
      parent = parent.parent;
    }
  }

  get values(): ProtoEnumValue[] {
    return this.descriptor
      .getValueList()
      .map((d, i) => new ProtoEnumValue(d, this, i));
  }

  get deprecationReason(): ProtoFile | ProtoMessage | ProtoEnum | null {
    return this.descriptor.getOptions()?.getDeprecated()
      ? this
      : this.parent.deprecationReason;
  }
}

export class ProtoEnumValue {
  constructor(
    readonly descriptor: EnumValueDescriptorProto,
    readonly parent: ProtoEnum,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  get tagNumber(): number {
    return this.descriptor.getNumber()!;
  }

  get description(): string {
    return this.comments?.leadingComments || "";
  }

  get comments(): Comments {
    return this.file.findComments(this);
  }

  get file(): ProtoFile {
    let parent: ProtoFile | ProtoMessage | ProtoEnum = this.parent;
    for (;;) {
      if (parent instanceof ProtoFile) return parent;
      parent = parent.parent;
    }
  }

  get deprecationReason():
    | ProtoFile
    | ProtoMessage
    | ProtoEnum
    | ProtoEnumValue
    | null {
    return this.descriptor.getOptions()?.getDeprecated()
      ? this
      : this.parent.deprecationReason;
  }
}
