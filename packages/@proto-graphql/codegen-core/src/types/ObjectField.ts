import type { DescField } from "@bufbuild/protobuf";
import { camelCase } from "change-case";

import type { EnumType } from "./EnumType.js";
import { FieldBase } from "./FieldBase.js";
import type { InterfaceType } from "./InterfaceType.js";
import type { ObjectType } from "./ObjectType.js";
import type { OneofUnionType } from "./OneofUnionType.js";
import type { ScalarType } from "./ScalarType.js";
import type { SquashedOneofUnionType } from "./SquashedOneofUnionType.js";
import { getFieldOptions, isRequiredField } from "./util.js";

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
      this.proto.proto.jsonName ||
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
