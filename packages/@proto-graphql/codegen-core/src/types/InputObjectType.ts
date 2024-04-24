import type { DescMessage } from "@bufbuild/protobuf";

import type { EnumType } from "./EnumType";
import { InputObjectField } from "./InputObjectField";
import type { ScalarType } from "./ScalarType";
import { TypeBase } from "./TypeBase";
import { getInputObjectFieldType } from "./types";
import {
  getInputTypeOptions,
  gqlTypeName,
  isIgnoredField,
  isOutputOnlyField,
} from "./util";

export class InputObjectType extends TypeBase<DescMessage> {
  /**
   * @override
   */
  override get typeName(): string {
    return `${gqlTypeName(this.proto)}Input`;
  }

  get fields(): InputObjectField<ScalarType | EnumType | InputObjectType>[] {
    return [
      ...this.proto.fields
        .filter((f) => !isOutputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map(
          (f) =>
            new InputObjectField(
              getInputObjectFieldType(f, this.options),
              this,
              f,
            ),
        ),
    ];
  }

  public hasPartialInput(): boolean {
    const noPartial = getInputTypeOptions(this.proto).noPartial;
    return !noPartial;
  }

  public toPartialInput(): InputObjectType {
    if (!this.hasPartialInput()) {
      throw new Error(`${this.typeName} does not support partial input`);
    }
    return new PartialInputObjectType(this.proto, this.options);
  }
}

class PartialInputObjectType extends InputObjectType {
  override get typeName(): string {
    return `${gqlTypeName(this.proto)}PartialInput`;
  }

  override get fields() {
    return super.fields.map((f) => f.toPartialInput());
  }
}
