import { ProtoMessage } from "@proto-graphql/proto-descriptors";
import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeOptions } from "./options";
import { TypeBase } from "./TypeBase";

export class SquashedOneofUnionType extends TypeBase<ProtoMessage> {
  private readonly oneofUnionType: OneofUnionType;
  constructor(proto: ProtoMessage, options: TypeOptions) {
    super(proto, options);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], options);
  }

  get fields(): ObjectField<ObjectType>[] {
    return this.oneofUnionType.fields;
  }
}
