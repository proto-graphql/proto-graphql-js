import { ProtoMessage } from "@proto-graphql/proto-descriptors";
import { DslFile } from "./DslFile";
import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";

export class SquashedOneofUnionType extends TypeBase<ProtoMessage> {
  private readonly oneofUnionType: OneofUnionType;
  constructor(proto: ProtoMessage, file: DslFile) {
    super(proto, file);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], file);
  }

  get fields(): ObjectField<ObjectType>[] {
    return this.oneofUnionType.fields;
  }
}
