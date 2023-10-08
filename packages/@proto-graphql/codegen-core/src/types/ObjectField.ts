import { ProtoField } from "@proto-graphql/proto-descriptors";

import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import { isRequiredField } from "./util";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";

export class ObjectField<
  T extends
    | ObjectType
    | InterfaceType
    | SquashedOneofUnionType
    | EnumType
    | ScalarType,
> extends FieldBase<ProtoField> {
  constructor(
    readonly type: T,
    readonly parent: ObjectType | OneofUnionType,
    proto: ProtoField
  ) {
    super(proto);
  }

  /**
   * @override
   */
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
    return !isRequiredField(this.proto, "output");
  }
}
