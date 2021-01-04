import * as path from "path";
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
import { FullNameImpl, getCommentSetByDescriptors, isDeprecated, memo } from "./common";
import {
  CommentSet,
  FullName,
  ProtoEnum,
  ProtoEnumValue,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoMethod,
  ProtoOneof,
  ProtoService,
} from "./interfaces";

export class ProtoRegistry {
  public fileByName: Record<string, ProtoFile>;
  private typeByFullName: Record<string, ProtoMessage | ProtoEnum>;

  constructor() {
    this.fileByName = {};
    this.typeByFullName = {};
  }

  public findFile(name: string): ProtoFile | null {
    return this.fileByName[name] ?? null;
  }

  public findTypeByFullName(fn: FullName | string): ProtoMessage | ProtoEnum | null {
    return this.typeByFullName[fn.toString()] ?? null;
  }

  public addFile(fd: FileDescriptorProto) {
    const file = new ProtoFileImpl(fd, this);
    this.fileByName[fd.getName()!] = file;

    const [msgs, enums] = this.collectTypes(file);
    for (const t of [...msgs, ...enums]) {
      this.typeByFullName[t.fullName.toString()] = t;
    }
  }

  public collectTypes(file: ProtoFile): [ProtoMessage[], ProtoEnum[]] {
    const [msgs, enums] = [file.messages, file.enums];
    const [childMsgs, childEnums] = this.collectTypesFromMessage(file.messages);
    msgs.push(...childMsgs);
    enums.push(...childEnums);
    return [msgs, enums];
  }

  private collectTypesFromMessage(inputs: ProtoMessage[]): [ProtoMessage[], ProtoEnum[]] {
    const msgs: ProtoMessage[] = [];
    const enums: ProtoEnum[] = [];

    for (const input of inputs) {
      const [childMsgs, childEnums] = this.collectTypesFromMessage(input.messages);
      msgs.push(...input.messages, ...childMsgs);
      enums.push(...input.enums, ...childEnums);
    }

    return [msgs, enums];
  }
}

export class ProtoFileImpl implements ProtoFile {
  public readonly kind = "File";

  constructor(readonly descriptor: FileDescriptorProto, private readonly registry: ProtoRegistry) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(null, this.package);
  }

  get messages(): ProtoMessage[] {
    return this.descriptor.getMessageTypeList().map((d, i) => new ProtoMessageImpl(d, this, i, this.registry));
  }

  get package(): string {
    return this.descriptor.getPackage()!;
  }

  get enums(): ProtoEnum[] {
    return this.descriptor.getEnumTypeList().map((d, i) => new ProtoEnumImpl(d, this, i));
  }

  get services(): ProtoService[] {
    return this.descriptor.getServiceList().map((d, i) => new ProtoServiceImpl(d, this, i, this.registry));
  }

  @memo()
  get googleProtobufImportPath(): string {
    const { dir, name } = path.parse(this.name);
    return `${dir}/${name}_pb`;
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoServiceImpl implements ProtoService {
  public readonly kind = "Service";

  constructor(
    readonly descriptor: ServiceDescriptorProto,
    readonly parent: ProtoFile,
    readonly index: number,
    private readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get file(): ProtoFile {
    return this.parent;
  }

  @memo()
  get methods(): ProtoMethod[] {
    return this.descriptor.getMethodList().map((m, i) => new ProtoMethodImpl(m, this, i, this.registry));
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoMethodImpl implements ProtoMethod {
  public readonly kind = "Method";

  constructor(
    readonly descriptor: MethodDescriptorProto,
    readonly parent: ProtoService,
    readonly index: number,
    private readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get input(): ProtoMessage {
    const fullName = this.descriptor.getInputType()!.replace(/^./, "");
    const msg = this.registry.findTypeByFullName(fullName);
    if (msg == null || msg.kind !== "Message") throw new Error(`${fullName} is not found`);
    return msg;
  }

  @memo()
  get output(): ProtoMessage {
    const fullName = this.descriptor.getOutputType()!.replace(/^./, "");
    const msg = this.registry.findTypeByFullName(fullName);
    if (msg == null || msg.kind !== "Message") throw new Error(`${fullName} is not found`);
    return msg;
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoMessageImpl implements ProtoMessage {
  public readonly kind = "Message";

  constructor(
    readonly descriptor: DescriptorProto,
    readonly parent: ProtoFile | ProtoMessage,
    readonly index: number,
    private readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get file(): ProtoFile {
    return "file" in this.parent ? this.parent.file : this.parent;
  }

  @memo()
  get fields(): ProtoField[] {
    return this.descriptor.getFieldList().map((d, i) => new ProtoFieldImpl(d, this, i, this.registry));
  }

  @memo()
  get oneofs(): ProtoOneof[] {
    return this.descriptor.getOneofDeclList().map((d, i) => new ProtoOneofImpl(d, this, i));
  }

  @memo()
  get messages(): ProtoMessage[] {
    return this.descriptor.getNestedTypeList().map((d, i) => new ProtoMessageImpl(d, this, i, this.registry));
  }

  @memo()
  get enums(): ProtoEnum[] {
    return this.descriptor.getEnumTypeList().map((d, i) => new ProtoEnumImpl(d, this, i));
  }

  @memo()
  get comments(): CommentSet {
    return getCommentSetByDescriptors(this);
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoOneofImpl implements ProtoOneof {
  public readonly kind = "Oneof";

  constructor(readonly descriptor: OneofDescriptorProto, readonly parent: ProtoMessage, readonly index: number) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get fields(): ProtoField[] {
    return this.parent.fields.filter(
      (f) => f.descriptor.hasOneofIndex() && f.descriptor.getOneofIndex() === this.index
    );
  }

  @memo()
  get comments(): CommentSet {
    return getCommentSetByDescriptors(this);
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoFieldImpl implements ProtoField {
  public readonly kind = "Field";

  constructor(
    readonly descriptor: FieldDescriptorProto,
    readonly parent: ProtoMessage,
    readonly index: number,
    private readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  get jsonName(): string {
    return this.descriptor.getJsonName()!;
  }

  get number(): number {
    return this.descriptor.getNumber()!;
  }

  @memo()
  get type(): ProtoMessage | ProtoEnum | null {
    return this.registry.findTypeByFullName(this.descriptor.getTypeName()!.replace(/^\./, ""));
  }

  @memo()
  get containingOneof(): ProtoOneof | null {
    if (!this.descriptor.hasOneofIndex()) return null;

    const idx = this.descriptor.getOneofIndex();
    return idx != null ? this.parent.oneofs[idx] : null;
  }

  @memo()
  get list(): boolean {
    return this.descriptor.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED;
  }

  @memo()
  get comments(): CommentSet {
    return getCommentSetByDescriptors(this);
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }

  @memo()
  get googleProtobufGetterName(): string {
    const name = this.jsonName;
    let suffix = "";
    if (this.list) {
      suffix += "List";
    }
    return `get${name.charAt(0).toUpperCase()}${name.slice(1)}${suffix}`;
  }
}

export class ProtoEnumImpl implements ProtoEnum {
  public readonly kind = "Enum";

  constructor(
    readonly descriptor: EnumDescriptorProto,
    readonly parent: ProtoFile | ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get file(): ProtoFile {
    return "file" in this.parent ? this.parent.file : this.parent;
  }

  @memo()
  get values(): ProtoEnumValue[] {
    return this.descriptor.getValueList().map((d, i) => new ProtoEnumValueImpl(d, this, i));
  }

  @memo()
  get comments(): CommentSet {
    return getCommentSetByDescriptors(this);
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}

export class ProtoEnumValueImpl implements ProtoEnumValue {
  public readonly kind = "EnumValue";

  constructor(readonly descriptor: EnumValueDescriptorProto, readonly parent: ProtoEnum, readonly index: number) {}

  get name(): string {
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  get number(): number {
    return this.descriptor.getNumber()!;
  }

  @memo()
  get comments(): CommentSet {
    return getCommentSetByDescriptors(this);
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }
}
