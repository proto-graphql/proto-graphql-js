import type { DescEnum, DescEnumValue } from "@bufbuild/protobuf";
import { constantCase } from "change-case";

import { TypeBase } from "./TypeBase.js";
import {
  descriptionFromProto,
  getDeprecationReason,
  isIgnoredField,
} from "./util.js";

export class EnumType extends TypeBase<DescEnum> {
  get unspecifiedValue(): EnumTypeValue | null {
    return this.valuesWithIgnored.find((v) => v.isUnespecified()) ?? null;
  }

  get values(): EnumTypeValue[] {
    return this.valuesWithIgnored
      .filter((v) => !v.isIgnored())
      .filter((v) => !v.isUnespecified());
  }

  get valuesWithIgnored(): EnumTypeValue[] {
    return this.proto.values.map((v) => new EnumTypeValue(v));
  }
}

export class EnumTypeValue {
  constructor(readonly proto: DescEnumValue) {}

  get name(): string {
    const prefix = getPrefix(this.proto);
    return this.proto.name.replace(new RegExp(`^${prefix}_`), "");
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get deprecationReason(): string | null {
    return getDeprecationReason(this.proto);
  }

  public isIgnored(): boolean {
    return isIgnoredField(this.proto);
  }

  public isUnespecified(): boolean {
    return (
      this.proto.number === 0 &&
      this.proto.name === `${constantCase(this.proto.parent.name)}_UNSPECIFIED`
    );
  }

  get number(): number {
    return this.proto.number;
  }
}

function getPrefix(desc: DescEnum | DescEnumValue): string {
  const descEnum: DescEnum = desc.kind === "enum" ? desc : desc.parent;
  return constantCase(descEnum.name);
}
