import { ProtoOneof } from "@proto-graphql/proto-descriptors";
import assert from "assert";
import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { TypeBase } from "./TypeBase";
import { getObjectFieldType } from "./types";
import { isIgnoredField, isInputOnlyField } from "./util";

export class OneofUnionType extends TypeBase<ProtoOneof> {
  get fields(): ObjectField<ObjectType>[] {
    return this.proto.fields
      .filter((f) => !isIgnoredField(f))
      .filter((f) => !isInputOnlyField(f))
      .map((f) => {
        const type = getObjectFieldType(f, this.options);
        // FIXME: raise user-friendly error
        assert(type instanceof ObjectType);
        return new ObjectField(type, this, f);
      });
  }
}
