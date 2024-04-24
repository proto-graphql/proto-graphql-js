import type { DescOneof } from "@bufbuild/protobuf";

import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { TypeBase } from "./TypeBase";
import { getObjectFieldType } from "./types";
import { isIgnoredField, isInputOnlyField } from "./util";

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
