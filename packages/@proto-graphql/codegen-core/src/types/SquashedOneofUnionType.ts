import type { DescMessage } from "@bufbuild/protobuf";

import type { ObjectField } from "./ObjectField";
import type { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";
import type { TypeOptions } from "./options";

export class SquashedOneofUnionType extends TypeBase<DescMessage> {
  private readonly oneofUnionType: OneofUnionType;
  constructor(proto: DescMessage, options: TypeOptions) {
    super(proto, options);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], options);
  }

  get fields(): ObjectField<ObjectType>[] {
    return this.oneofUnionType.fields;
  }
}
