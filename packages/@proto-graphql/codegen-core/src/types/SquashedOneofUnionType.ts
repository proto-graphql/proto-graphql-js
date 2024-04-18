import { DescMessage } from "@bufbuild/protobuf";

import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";
import { TypeOptions } from "./options";

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
