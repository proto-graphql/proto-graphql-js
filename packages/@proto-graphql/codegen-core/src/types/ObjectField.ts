import { ProtoField } from "@proto-graphql/proto-descriptors";
import * as extensions from "../__generated__/extensions/graphql/schema_pb";
import { EnumType } from "./EnumType";
import { FieldBase } from "./FieldBase";
import { InterfaceType } from "./InterfaceType";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { ScalarType } from "./ScalarType";
import { SquashedOneofUnionType } from "./SquashedOneofUnionType";
import { GenerationParams, isRequiredField } from "./util";

export class ObjectField<
  T extends ObjectType | InterfaceType | SquashedOneofUnionType | EnumType | ScalarType
> extends FieldBase<ProtoField> {
  constructor(
    readonly type: T,
    readonly parent: ObjectType | OneofUnionType,
    proto: ProtoField,
    opts: GenerationParams & { dsl: "nexus" | "pothos" }
  ) {
    super(proto, opts);
  }

  /**
   * @override
   */
  get name(): string {
    return this.proto.descriptor.getOptions()?.getExtension(extensions.field)?.getName() || this.proto.jsonName;
  }

  /**
   * @override
   */
  public override isNullable() {
    return !isRequiredField(this.proto, "output");
  }
}
