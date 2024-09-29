import type { DescOneof } from "@bufbuild/protobuf";
import { camelCase } from "change-case";

import { FieldBase } from "./FieldBase.js";
import type { ObjectType } from "./ObjectType.js";
import type { OneofUnionType } from "./OneofUnionType.js";
import { isRequiredField } from "./util.js";

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
