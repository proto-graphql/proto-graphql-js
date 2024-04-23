import { DescField } from "@bufbuild/protobuf";
import { camelCase } from "case-anything";

import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import { getFieldOptions, isRequiredField } from "./util";

export class ObjectField<
  T extends
    | ObjectType
    | InterfaceType
    | SquashedOneofUnionType
    | EnumType
    | ScalarType,
> extends FieldBase<DescField> {
  constructor(
    readonly type: T,
    readonly parent: ObjectType | OneofUnionType,
    proto: DescField,
  ) {
    super(proto);
  }

  /**
   * @override
   */
  get name(): string {
    return (
      getFieldOptions(this.proto).name ||
      this.proto.jsonName ||
      camelCase(this.proto.name)
    );
  }

  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "output");
  }
}
