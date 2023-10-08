import {
  ProtoEnum,
  ProtoMessage,
  ProtoOneof,
} from "@proto-graphql/proto-descriptors";

import { TypeOptions } from "./options";
import { descriptionFromProto, gqlTypeName } from "./util";

export abstract class TypeBase<
  P extends ProtoMessage | ProtoEnum | ProtoOneof,
> {
  constructor(
    readonly proto: P,
    readonly options: TypeOptions
  ) {}

  get typeName(): string {
    return gqlTypeName(this.proto);
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }
}
