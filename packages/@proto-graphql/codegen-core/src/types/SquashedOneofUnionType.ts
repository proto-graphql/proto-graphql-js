import type { DescMessage } from "@bufbuild/protobuf";

import type { ObjectField } from "./ObjectField.js";
import type { ObjectType } from "./ObjectType.js";
import { OneofUnionType } from "./OneofUnionType.js";
import type { TypeOptions } from "./options.js";
import { TypeBase } from "./TypeBase.js";

export class SquashedOneofUnionType extends TypeBase<DescMessage> {
  readonly oneofUnionType: OneofUnionType;
  constructor(proto: DescMessage, options: TypeOptions) {
    super(proto, options);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], options);
  }

  get fields(): ObjectField<ObjectType>[] {
    return this.oneofUnionType.fields;
  }
}
