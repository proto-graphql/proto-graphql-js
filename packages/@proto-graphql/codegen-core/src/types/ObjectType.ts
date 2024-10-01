import type { DescMessage } from "@bufbuild/protobuf";
import { ObjectField } from "./ObjectField.js";
import { ObjectOneofField } from "./ObjectOneofField.js";
import { OneofUnionType } from "./OneofUnionType.js";
import { TypeBase } from "./TypeBase.js";
import { getObjectFieldType } from "./types.js";
import { isIgnoredField, isInputOnlyField, isSyntheticOneof } from "./util.js";

export class ObjectType extends TypeBase<DescMessage> {
  get fields(): (ObjectField<any> | ObjectOneofField)[] {
    return [
      ...this.proto.fields
        .filter((f) => f.oneof == null || isSyntheticOneof(f.oneof))
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map(
          (f) => new ObjectField(getObjectFieldType(f, this.options), this, f),
        ),
      ...this.proto.oneofs
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map(
          (o) =>
            new ObjectOneofField(new OneofUnionType(o, this.options), this, o),
        ),
    ];
  }
}
