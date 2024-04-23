import { DescOneof } from "@bufbuild/protobuf";
import { camelCase } from "case-anything";

import { FieldBase } from "./FieldBase";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { isRequiredField } from "./util";

export class ObjectOneofField extends FieldBase<DescOneof> {
  constructor(
    readonly type: OneofUnionType,
    private readonly parent: ObjectType,
    proto: DescOneof,
  ) {
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
