import ts from "typescript";
import assert from "assert";
import {
  CommentSet,
  ProtoEnum,
  ProtoEnumValue,
  ProtoField,
  ProtoFile,
  ProtoMessage,
  ProtoOneof,
  ProtoRegistry,
} from "../../protogen";
import {
  createProtoFullName,
  exceptRequestOrResponse,
  getDeprecationReason,
  gqlTypeName,
  isIgnoredField,
  isIgnoredType,
  isInputOnlyField,
  isInterface,
  isOutputOnlyField,
  isRequiredField,
  isSquashedUnion,
  protoExportAlias,
  protoImportPath,
  GenerationParams,
  FullName,
  modulesWithUniqueImportAlias,
} from "./util";
import * as extensions from "../../__generated__/extensions/graphql/schema_pb";
import { camelCase, constantCase } from "change-case";
import { FieldDescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";

import { getUnwrapFunc, UnwrapFunc } from "./unwrap";

type GqlScalarType = "Int" | "Float" | "String" | "Boolean" | "ID" | "DateTime";
export type GqlType =
  | ScalarType
  | ObjectType
  | InterfaceType
  | OneofUnionType
  | SquashedOneofUnionType
  | EnumType
  | InputObjectType;

export function collectTypesFromFile(file: DslFile, registry: ProtoRegistry) {
  const [msgs, enums] = file.proto.collectTypesRecursively();

  return [
    ...buildObjectTypes(msgs, file, registry),
    ...buildInputObjectTypes(msgs, file, registry),
    ...buildInterfaceType(msgs, file, registry),
    ...buildSquashedOneofUnionTypes(msgs, file),
    ...buildOneofUnionTypes(msgs, file),
    ...buildEnumTypes(enums, file),
  ];
}

function buildObjectTypes(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): ObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => !isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new ObjectType(m, file));
}

function buildInputObjectTypes(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): InputObjectType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InputObjectType(m, file));
}

function buildInterfaceType(msgs: ProtoMessage[], file: DslFile, registry: ProtoRegistry): InterfaceType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => !isSquashedUnion(m))
    .filter((m) => isInterface(m))
    .filter(exceptRequestOrResponse(registry))
    .map((m) => new InterfaceType(m, file));
}

function buildSquashedOneofUnionTypes(msgs: ProtoMessage[], file: DslFile): SquashedOneofUnionType[] {
  return msgs
    .filter((m) => !isIgnoredType(m))
    .filter((m) => isSquashedUnion(m))
    .map((m) => new SquashedOneofUnionType(m, file));
}

function buildOneofUnionTypes(msgs: ProtoMessage[], file: DslFile): OneofUnionType[] {
  return msgs
    .filter((m) => !isSquashedUnion(m))
    .flatMap((m) => m.oneofs)
    .filter((o) => !isIgnoredField(o))
    .map((o) => new OneofUnionType(o, file));
}

function buildEnumTypes(enums: ProtoEnum[], file: DslFile): EnumType[] {
  return enums.filter((e) => !isIgnoredType(e)).map((e) => new EnumType(e, file));
}

export class DslFile {
  constructor(readonly proto: ProtoFile, readonly options: GenerationParams) {}

  get filename(): string {
    return this.proto.name.replace(/\.proto$/, "_pb_nexus.ts");
  }
}

abstract class TypeBase<P extends ProtoMessage | ProtoEnum | ProtoOneof> {
  constructor(protected readonly proto: P, protected readonly file: DslFile) {}

  get typeName(): string {
    return gqlTypeName(this.proto);
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get exportTypes(): { name: string; type: FullName }[] {
    return [];
  }

  get importModules(): { alias: string; module: string }[] {
    return modulesWithUniqueImportAlias(["nexus"]);
  }

  protected get options(): GenerationParams {
    return this.file.options;
  }
}

export class ObjectType extends TypeBase<ProtoMessage> {
  /**
   * @override
   */
  get exportTypes(): { name: string; type: FullName }[] {
    return [...super.exportTypes, { name: this.sourceTypeExportAlias, type: this.protoTypeFullName }];
  }

  /**
   * @override
   */
  get importModules(): { alias: string; module: string }[] {
    return [
      ...super.importModules,
      ...modulesWithUniqueImportAlias([this.protoImportPath]),
      ...this.fields.flatMap((f) => f.importModules),
    ];
  }

  get protoImportPath(): string {
    return protoImportPath(this.proto, this.options);
  }

  get sourceTypeExportAlias(): string {
    return protoExportAlias(this.proto, this.options);
  }

  get protoTypeFullName(): FullName {
    return createProtoFullName(this.proto, this.options);
  }

  get fields(): ObjectField<any, any>[] {
    return [
      ...this.proto.fields
        .filter((f) => f.containingOneof == null)
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((f) => new ObjectField(detectType(f, this.options), f, this.options)),
      ...this.proto.oneofs
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((o) => new ObjectField(new OneofUnionType(o, this.file), o, this.options)),
    ];
  }
}

export class ObjectField<
  P extends ProtoField | ProtoOneof,
  T extends P extends ProtoOneof ? OneofUnionType : Exclude<GqlType, OneofUnionType>
> {
  constructor(readonly type: T, private readonly proto: P, private readonly opts: GenerationParams) {}

  get name(): string {
    const proto: ProtoField | ProtoOneof = this.proto;
    if (proto.kind === "Oneof") {
      return camelCase(proto.name);
    }
    return proto.descriptor.getOptions()?.getExtension(extensions.field)?.getName() || proto.jsonName;
  }

  get protoJsName(): string {
    const proto: ProtoField | ProtoOneof = this.proto;
    if (this.opts.useProtobufjs || proto.kind === "Oneof") return camelCase(proto.name);
    return proto.jsonName;
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get importModules(): { alias: string; module: string }[] {
    const modules = [];
    if (this.type instanceof ScalarType && this.type.unwrapFunc != null) {
      modules.push(...this.type.unwrapFunc.imports);
    }
    if (this.type instanceof EnumType && this.type.unspecifiedValue != null) {
      modules.push(this.type.protoImportPath);
    }
    return modulesWithUniqueImportAlias(modules);
  }

  public isOneof(): boolean {
    return this.proto.kind === "Oneof";
  }

  public isList(): boolean {
    const proto: ProtoField | ProtoOneof = this.proto;
    return proto.kind === "Field" && proto.list;
  }

  public isNullable(): boolean {
    if (isRequiredField(this.proto)) return false;
    return this.type instanceof ScalarType ? !this.type.isPrimitive() : true;
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public shouldNullCheck(): boolean {
    const proto: ProtoField | ProtoOneof = this.proto;
    if (proto.kind === "Oneof") return false;
    if (this.opts.useProtobufjs) return true;
    if (proto.kind === "Field" && proto.list) return false;
    if (this.type instanceof ScalarType && this.type.isPrimitive()) return false;

    return true;
  }

  // FIXME: remove
  public isProtobufjs(): boolean {
    return this.opts.useProtobufjs;
  }

  public getProtoFieldAccessExpr(parentExpr: ts.Expression): ts.Expression {
    const proto: ProtoField | ProtoOneof = this.proto;
    assert.strictEqual(proto.kind, "Field" as const);

    let expr: ts.Expression = ts.factory.createPropertyAccessExpression(
      parentExpr,
      ts.factory.createIdentifier(this.opts.useProtobufjs ? this.protoJsName : proto.googleProtobufGetterName)
    );
    if (!this.opts.useProtobufjs) {
      expr = ts.factory.createCallExpression(expr, undefined, undefined);
    }
    return expr;
  }
}

class OneofMemberField extends ObjectField<ProtoField, ObjectType> {
  constructor(proto: ProtoField, file: DslFile, opts: GenerationParams) {
    assert.strictEqual(proto.type?.kind, "Message" as const);
    super(new ObjectType(proto.type, file), proto, opts);
  }
}

export class InputObjectType extends TypeBase<ProtoMessage> {
  /**
   * @override
   */
  get typeName(): string {
    return gqlTypeName(this.proto, { input: true });
  }

  get fields(): InputObjectField<any>[] {
    return [
      ...this.proto.fields
        .filter((f) => !isOutputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((f) => new InputObjectField(detectType(f, { ...this.options, input: true }), f, this.options)),
    ];
  }
}

export class InputObjectField<T extends GqlType> {
  constructor(readonly type: T, private readonly proto: ProtoField, private readonly opts: GenerationParams) {}

  get name(): string {
    return this.proto.descriptor.getOptions()?.getExtension(extensions.field)?.getName() || this.proto.jsonName;
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public isList(): boolean {
    const proto: ProtoField | ProtoOneof = this.proto;
    return proto.kind === "Field" && proto.list;
  }

  public isNullable(): boolean {
    if (isRequiredField(this.proto)) return false;
    return this.type instanceof ScalarType ? !this.type.isPrimitive() : true;
  }
}

export class InterfaceType extends ObjectType {}

export class OneofUnionType extends TypeBase<ProtoOneof> {
  get fields(): OneofMemberField[] {
    return this.proto.fields
      .filter((f) => !isIgnoredField(f))
      .filter((f) => !isInputOnlyField(f))
      .map((f) => new OneofMemberField(f, this.file, this.options));
  }

  // FIXME: remove
  get parentProtoTypeFullName(): FullName {
    return createProtoFullName(this.proto.parent, this.options);
  }
}

export class SquashedOneofUnionType extends TypeBase<ProtoMessage> {
  private readonly oneofUnionType: OneofUnionType;
  constructor(proto: ProtoMessage, file: DslFile) {
    super(proto, file);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], file);
  }

  get fields(): OneofMemberField[] {
    return this.oneofUnionType.fields;
  }

  // FIXME: remove
  get parentProtoTypeFullName(): FullName {
    return this.oneofUnionType.parentProtoTypeFullName;
  }
}

export class EnumType extends TypeBase<ProtoEnum> {
  get protoImportPath(): string {
    return protoImportPath(this.proto, this.options);
  }

  get unspecifiedValue(): EnumTypeValue | null {
    return this.valuesWithIgnored.find((v) => v.isUnespecified()) ?? null;
  }

  get values(): EnumTypeValue[] {
    return this.valuesWithIgnored.filter((v) => !v.isIgnored()).filter((v) => !v.isUnespecified());
  }

  get valuesWithIgnored(): EnumTypeValue[] {
    return this.proto.values.map((v) => new EnumTypeValue(v, this.options));
  }
}

export class EnumTypeValue {
  constructor(private readonly proto: ProtoEnumValue, private readonly opts: GenerationParams) {}

  get name(): string {
    return this.proto.name;
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public isIgnored(): boolean {
    return isIgnoredField(this.proto);
  }

  get fullName(): FullName {
    return [createProtoFullName(this.proto.parent, this.opts), this.proto.name];
  }

  public isUnespecified(): boolean {
    return this.proto.index === 0 && this.proto.name === `${constantCase(this.proto.parent.name)}_UNSPECIFIED`;
  }

  get number(): number {
    return this.proto.number;
  }
}

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

  get unwrapFunc(): UnwrapFunc | null {
    return getUnwrapFunc(this.proto, this.opts);
  }
}

function detectType(
  proto: ProtoField,
  { input, ...opts }: GenerationParams & { input?: boolean }
): Exclude<GqlType, OneofUnionType> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const pbtype = proto.descriptor.getType()!;
  switch (pbtype) {
    case FieldDescriptorProto.Type.TYPE_STRING:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_DOUBLE:
    case FieldDescriptorProto.Type.TYPE_FLOAT:
      return new ScalarType(proto, "Float", opts);
    case FieldDescriptorProto.Type.TYPE_INT64:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_UINT64:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_INT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_FIXED64:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_FIXED32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_UINT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SFIXED32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SFIXED64:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_SINT32:
      return new ScalarType(proto, "Int", opts);
    case FieldDescriptorProto.Type.TYPE_SINT64:
      return new ScalarType(proto, "String", opts);
    case FieldDescriptorProto.Type.TYPE_BOOL:
      return new ScalarType(proto, "Boolean", opts);
    case FieldDescriptorProto.Type.TYPE_GROUP:
      throw "not supported";
    case FieldDescriptorProto.Type.TYPE_BYTES:
      throw "not supported";
    case FieldDescriptorProto.Type.TYPE_ENUM:
      assert(proto.type && proto.type.kind === "Enum");
      return new EnumType(proto.type, new DslFile(proto.type.file, opts));
    case FieldDescriptorProto.Type.TYPE_MESSAGE:
      assert(proto.type && proto.type.kind === "Message");
      switch (proto.type.fullName.toString()) {
        case "google.protobuf.Any":
          throw "not supported";
        case "google.protobuf.BoolValue":
          return new ScalarType(proto, "Boolean", opts);
        case "google.protobuf.BytesValue":
          throw "not supported";
        case "google.protobuf.DoubleValue":
        case "google.protobuf.FloatValue":
          return new ScalarType(proto, "Float", opts);
        case "google.protobuf.Duration":
          throw "not supported";
        case "google.protobuf.Int32Value":
          return new ScalarType(proto, "Int", opts);
        case "google.protobuf.Int64Value":
          return new ScalarType(proto, "String", opts);
        case "google.protobuf.UInt32Value":
          return new ScalarType(proto, "Int", opts);
        case "google.protobuf.UInt64Value":
          return new ScalarType(proto, "String", opts);
        case "google.protobuf.StringValue":
          return new ScalarType(proto, "String", opts);
        case "google.protobuf.Timestamp":
          return new ScalarType(proto, "DateTime", opts);
        default:
          return buildFromProtoMessage(proto.type, { input, ...opts });
      }
    /* istanbul ignore next */
    default:
      const _exhaustiveCheck: never = pbtype; // eslint-disable-line
      throw "unreachable";
  }
}

function buildFromProtoMessage(
  msg: ProtoMessage,
  { input, ...opts }: GenerationParams & { input?: boolean }
): ObjectType | InputObjectType | InterfaceType | SquashedOneofUnionType {
  const file = new DslFile(msg.file, opts);
  if (input) return new InputObjectType(msg, file);
  if (isInterface(msg)) return new InterfaceType(msg, file);
  if (isSquashedUnion(msg)) return new SquashedOneofUnionType(msg, file);
  return new ObjectType(msg, file);
}

function descriptionFromProto(proto: { comments: CommentSet }): string | null {
  return proto.comments.leadingComments.trim() || null;
}
