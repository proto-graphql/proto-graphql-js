import { ProtoField, ProtoOneof } from "@proto-graphql/proto-descriptors";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";
import { descriptionFromProto, getDeprecationReason } from "./util";

export abstract class FieldBase<P extends ProtoField | ProtoOneof> {
  constructor(readonly proto: P) {}

  abstract get name(): string;
  public abstract isNullable(): boolean;

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  public isList(): boolean {
    const proto: ProtoField | ProtoOneof = this.proto;
    return proto.kind === "Field" && proto.list;
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public isResolverSkipped(): boolean {
    return this.proto.descriptor.getOptions()?.getExtension(extensions.field)?.getSkipResolver() ?? false;
  }
}
