import type { DescOneof } from "@bufbuild/protobuf";

import { ObjectField } from "./ObjectField.js";
import { ObjectType } from "./ObjectType.js";
import { TypeBase } from "./TypeBase.js";
import { getObjectFieldType } from "./types.js";
import { isIgnoredField, isInputOnlyField } from "./util.js";

export class OneofUnionType extends TypeBase<DescOneof> {
  get fields(): ObjectField<ObjectType>[] {
    return this.proto.fields
      .filter((f) => !isIgnoredField(f))
      .filter((f) => !isInputOnlyField(f))
      .map((f) => {
        const type = getObjectFieldType(f, this.options);
        if (!(type instanceof ObjectType)) {
          if (this.options.ignoreNonMessageOneofFields) return null;
          throw new Error("non-message types in oneof fields are not required");
        }
        return new ObjectField(type, this, f);
      })
      .filter((f): f is NonNullable<typeof f> => f != null);
  }
}
