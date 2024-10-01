import type { DescMessage } from "@bufbuild/protobuf";

import type { EnumType } from "./EnumType.js";
import { InputObjectField } from "./InputObjectField.js";
import type { ScalarType } from "./ScalarType.js";
import { TypeBase } from "./TypeBase.js";
import { getInputObjectFieldType } from "./types.js";
import {
  getInputTypeOptions,
  gqlTypeName,
  isIgnoredField,
  isOutputOnlyField,
} from "./util.js";

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
