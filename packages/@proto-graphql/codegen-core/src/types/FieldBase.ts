import { DescField, DescOneof } from "@bufbuild/protobuf";

import {
  descriptionFromProto,
  getDeprecationReason,
  getFieldOptions,
} from "./util";

export abstract class FieldBase<P extends DescField | DescOneof> {
  constructor(readonly proto: P) {}

  abstract get name(): string;
  public abstract isNullable(): boolean;

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  public isList(): boolean {
    const proto: DescField | DescOneof = this.proto;
    return proto.kind === "field" && proto.repeated;
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public isResolverSkipped(): boolean {
    switch (this.proto.kind) {
      case "field": {
        return getFieldOptions(this.proto).skipResolver;
      }
      case "oneof": {
        return false;
      }
    }
  }
}
