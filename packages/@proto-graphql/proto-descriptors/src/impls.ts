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

import {
  FullNameImpl,
  getCommentSetByDescriptors,
  isDeprecated,
  memo,
} from "./common";
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
  ProtoScalar,
  ProtoService,
} from "./interfaces";
import { getScalarTypeFromDescriptor } from "./scalars";

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

  public findTypeByFullName(
    fn: FullName | string
  ): ProtoMessage | ProtoEnum | null {
    return this.typeByFullName[fn.toString()] ?? null;
  }

  public addFile(fd: FileDescriptorProto) {
    const file = new ProtoFileImpl(fd, this);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.fileByName[fd.getName()!] = file;

    const [msgs, enums] = file.collectTypesRecursively();
    for (const t of [...msgs, ...enums]) {
      this.typeByFullName[t.fullName.toString()] = t;
    }
  }
}

export class ProtoFileImpl implements ProtoFile {
  public readonly kind = "File";

  constructor(
    readonly descriptor: FileDescriptorProto,
    private readonly registry: ProtoRegistry
  ) {}

  get name(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(null, this.package);
  }

  get messages(): ProtoMessage[] {
    return this.descriptor
      .getMessageTypeList()
      .map((d, i) => new ProtoMessageImpl(d, this, i, this.registry));
  }

  get package(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getPackage()!;
  }

  get enums(): ProtoEnum[] {
    return this.descriptor
      .getEnumTypeList()
      .map((d, i) => new ProtoEnumImpl(d, this, i));
  }

  get services(): ProtoService[] {
    return this.descriptor
      .getServiceList()
      .map((d, i) => new ProtoServiceImpl(d, this, i, this.registry));
  }

  @memo()
  get deprecated(): boolean {
    return isDeprecated(this);
  }

  public collectTypesRecursively(): [ProtoMessage[], ProtoEnum[]] {
    const [msgs, enums] = [this.messages, this.enums];
    const [childMsgs, childEnums] = this.collectTypesRecursivelyFromMessage(
      this.messages
    );
    msgs.push(...childMsgs);
    enums.push(...childEnums);
    return [msgs, enums];
  }

  private collectTypesRecursivelyFromMessage(
    inputs: ProtoMessage[]
  ): [ProtoMessage[], ProtoEnum[]] {
    const msgs: ProtoMessage[] = [];
    const enums: ProtoEnum[] = [];

    for (const input of inputs) {
      const [childMsgs, childEnums] = this.collectTypesRecursivelyFromMessage(
        input.messages
      );
      msgs.push(...input.messages, ...childMsgs);
      enums.push(...input.enums, ...childEnums);
    }

    return [msgs, enums];
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    return this.descriptor
      .getMethodList()
      .map((m, i) => new ProtoMethodImpl(m, this, i, this.registry));
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get input(): ProtoMessage {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fullName = this.descriptor.getInputType()!.replace(/^./, "");
    const msg = this.registry.findTypeByFullName(fullName);
    if (msg == null || msg.kind !== "Message")
      throw new Error(`${fullName} is not found`);
    return msg;
  }

  @memo()
  get output(): ProtoMessage {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fullName = this.descriptor.getOutputType()!.replace(/^./, "");
    const msg = this.registry.findTypeByFullName(fullName);
    if (msg == null || msg.kind !== "Message")
      throw new Error(`${fullName} is not found`);
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    return this.descriptor
      .getFieldList()
      .map((d, i) => new ProtoFieldImpl(d, this, i, this.registry));
  }

  @memo()
  get oneofs(): ProtoOneof[] {
    return this.descriptor
      .getOneofDeclList()
      .map((d, i) => new ProtoOneofImpl(d, this, i));
  }

  @memo()
  get messages(): ProtoMessage[] {
    return this.descriptor
      .getNestedTypeList()
      .map((d, i) => new ProtoMessageImpl(d, this, i, this.registry));
  }

  @memo()
  get enums(): ProtoEnum[] {
    return this.descriptor
      .getEnumTypeList()
      .map((d, i) => new ProtoEnumImpl(d, this, i));
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

  constructor(
    readonly descriptor: OneofDescriptorProto,
    readonly parent: ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  @memo()
  get file(): ProtoFile {
    return this.parent.file;
  }

  @memo()
  get fields(): ProtoField[] {
    return this.parent.fields.filter(
      (f) =>
        f.descriptor.hasOneofIndex() &&
        f.descriptor.getOneofIndex() === this.index
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

  @memo()
  get synthetic(): boolean {
    return this.fields.length === 1 && this.fields[0].optional;
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  get jsonName(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getJsonName()!;
  }

  get number(): number {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getNumber()!;
  }

  @memo()
  get type(): ProtoMessage | ProtoEnum | ProtoScalar {
    const scalarType = getScalarTypeFromDescriptor(this.descriptor);
    if (scalarType !== undefined) return { kind: "Scalar", type: scalarType };

    const foundType = this.registry.findTypeByFullName(
      this.descriptor.getTypeName()!.replace(/^\./, "")
    );
    if (foundType === null)
      throw new Error(`Not found type for ${this.fullName.toString()}`);
    return foundType;
  }

  @memo()
  get containingOneof(): ProtoOneof | null {
    if (!this.descriptor.hasOneofIndex()) return null;

    const idx = this.descriptor.getOneofIndex();
    return idx != null ? this.parent.oneofs[idx] : null;
  }

  @memo()
  get list(): boolean {
    return (
      this.descriptor.getLabel() === FieldDescriptorProto.Label.LABEL_REPEATED
    );
  }

  @memo()
  get optional(): boolean {
    return this.descriptor.getProto3Optional() ?? false;
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

export class ProtoEnumImpl implements ProtoEnum {
  public readonly kind = "Enum";

  constructor(
    readonly descriptor: EnumDescriptorProto,
    readonly parent: ProtoFile | ProtoMessage,
    readonly index: number
  ) {}

  get name(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    return this.descriptor
      .getValueList()
      .map((d, i) => new ProtoEnumValueImpl(d, this, i));
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

  constructor(
    readonly descriptor: EnumValueDescriptorProto,
    readonly parent: ProtoEnum,
    readonly index: number
  ) {}

  get name(): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.descriptor.getName()!;
  }

  @memo()
  get fullName(): FullName {
    return new FullNameImpl(this.parent.fullName, this.name);
  }

  get number(): number {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
