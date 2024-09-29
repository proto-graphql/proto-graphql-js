import type { DescField } from "@bufbuild/protobuf";
import { camelCase } from "change-case";

import type { EnumType } from "./EnumType.js";
import { FieldBase } from "./FieldBase.js";
import { InputObjectType } from "./InputObjectType.js";
import type { ScalarType } from "./ScalarType.js";
import { getFieldOptions, isRequiredField } from "./util.js";

export class InputObjectField<
  T extends ScalarType | EnumType | InputObjectType,
> extends FieldBase<DescField> {
  constructor(
    readonly type: T,
    readonly parent: InputObjectType,
    proto: DescField,
  ) {
    super(proto);
  }

  get name(): string {
    return (
      getFieldOptions(this.proto).name ||
      this.proto.jsonName ||
      this.proto.proto.jsonName ||
      camelCase(this.proto.name)
    );
  }

  /**
   * @override
   */
  public override isNullable(): boolean {
    if (this.deprecationReason) return true;
    return !isRequiredField(this.proto, "input");
  }

  public toPartialInput(): InputObjectField<T> | PartialInputObjectField<T> {
    if (this.type instanceof InputObjectType) {
      return new PartialInputObjectField(
        (this.type.hasPartialInput()
          ? this.type.toPartialInput()
          : this.type) as any,
        this.parent,
        this.proto,
      );
    }
    return new PartialInputObjectField(this.type, this.parent, this.proto);
  }
}

class PartialInputObjectField<
  T extends ScalarType | EnumType | InputObjectType,
> extends InputObjectField<T> {
  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "partial_input");
  }
}
