import { ProtoEnum, ProtoMessage, ProtoOneof } from "@proto-graphql/proto-descriptors";
import { DslFile } from "./DslFile";
import { descriptionFromProto, gqlTypeName } from "./util";

export abstract class TypeBase<P extends ProtoMessage | ProtoEnum | ProtoOneof> {
  constructor(readonly proto: P, readonly file: DslFile) {}

  get typeName(): string {
    return gqlTypeName(this.proto);
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  protected get options() {
    return this.file.options;
  }
}
