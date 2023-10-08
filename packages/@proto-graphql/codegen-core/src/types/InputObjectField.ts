import { ProtoField } from "@proto-graphql/proto-descriptors";

import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InputObjectType } from "./InputObjectType";
import { ScalarType } from "./ScalarType";
import { isRequiredField } from "./util";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

export class InputObjectField<
  T extends ScalarType | EnumType | InputObjectType
> extends FieldBase<ProtoField> {
  constructor(
    readonly type: T,
    readonly parent: InputObjectType,
    proto: ProtoField
  ) {
    super(proto);
  }

  get name(): string {
    return (
      this.proto.descriptor
        .getOptions()
        ?.getExtension(extensions.field)
        ?.getName() || this.proto.jsonName
    );
  }

  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "input");
  }

  public toPartialInput(): InputObjectField<T> | PartialInputObjectField<T> {
    if (this.type instanceof InputObjectType) {
      return new PartialInputObjectField(
        (this.type.hasPartialInput()
          ? this.type.toPartialInput()
          : this.type) as any,
        this.parent,
        this.proto
      );
    }
    return new PartialInputObjectField(this.type, this.parent, this.proto);
  }
}

class PartialInputObjectField<
  T extends ScalarType | EnumType | InputObjectType
> extends InputObjectField<T> {
  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "partial_input");
  }
}
