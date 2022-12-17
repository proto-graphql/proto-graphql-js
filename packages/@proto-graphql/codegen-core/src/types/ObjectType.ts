import { ProtoMessage } from "@proto-graphql/proto-descriptors";
import { ObjectField } from "./ObjectField";
import { ObjectOneofField } from "./ObjectOneofField";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";
import { getObjectFieldType } from "./types";
import { isIgnoredField, isInputOnlyField } from "./util";

export class ObjectType extends TypeBase<ProtoMessage> {
  get fields(): (ObjectField<any> | ObjectOneofField)[] {
    return [
      ...this.proto.fields
        .filter((f) => f.containingOneof == null)
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map(
          (f) => new ObjectField(getObjectFieldType(f, this.options), this, f)
        ),
      ...this.proto.oneofs
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map(
          (o) =>
            new ObjectOneofField(new OneofUnionType(o, this.options), this, o)
        ),
    ];
  }
}
