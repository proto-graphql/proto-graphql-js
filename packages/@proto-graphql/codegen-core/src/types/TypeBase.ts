import { DescEnum, DescMessage, DescOneof } from "@bufbuild/protobuf";

import { TypeOptions } from "./options";
import { descriptionFromProto, gqlTypeName } from "./util";

export abstract class TypeBase<P extends DescMessage | DescEnum | DescOneof> {
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
