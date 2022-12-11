import { ProtoOneof } from "@proto-graphql/proto-descriptors";
import { camelCase } from "change-case";
import { FieldBase } from "./FieldBase";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { isRequiredField } from "./util";

export class ObjectOneofField extends FieldBase<ProtoOneof> {
  constructor(readonly type: OneofUnionType, private readonly parent: ObjectType, proto: ProtoOneof) {
    super(proto);
  }

  /**
   * @override
   */
  get name(): string {
    return camelCase(this.proto.name);
  }

  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "output");
  }
}
