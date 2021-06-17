import { ProtoField, ProtoOneof } from "../../protogen";
import * as extensions from "../../__generated__/extensions/graphql/schema_pb";
import { descriptionFromProto, FullName, GenerationParams, getDeprecationReason, isRequiredField } from "./util";

export abstract class FieldBase<P extends ProtoField | ProtoOneof> {
  constructor(protected readonly proto: P, protected readonly opts: GenerationParams) {}

  abstract get name(): string;
  abstract get protoJsName(): string;

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  public isList(): boolean {
    const proto: ProtoField | ProtoOneof = this.proto;
    return proto.kind === "Field" && proto.list;
  }

  public isNullable(): boolean {
    return !isRequiredField(this.proto);
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  // FIXME: remove
  public isProtobufjs(): boolean {
    return this.opts.useProtobufjs;
  }

  public isResolverSkipped(): boolean {
    return this.proto.descriptor.getOptions()?.getExtension(extensions.field)?.getSkipResolver() ?? false;
  }

  public shouldReferenceTypeWithString(): boolean {
    return this.opts.fileLayout === "proto_file" || this.typeFullName == null;
  }

  abstract get typeFullName(): FullName | null;
  abstract get importModules(): { alias: string; module: string }[];
  abstract shouldNullCheck(): boolean;
}
