import type { DescEnum, DescMessage, DescOneof } from "@bufbuild/protobuf";

import type { TypeOptions } from "./options.js";
import { descriptionFromProto, gqlTypeName } from "./util.js";

export abstract class TypeBase<P extends DescMessage | DescEnum | DescOneof> {
  constructor(
    readonly proto: P,
    readonly options: TypeOptions,
  ) {}

  get typeName(): string {
    return gqlTypeName(this.proto);
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }
}
