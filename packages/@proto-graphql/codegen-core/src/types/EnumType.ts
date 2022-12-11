import { ProtoEnum, ProtoEnumValue } from "@proto-graphql/proto-descriptors";
import { constantCase } from "change-case";
import { TypeBase } from "./TypeBase";
import { descriptionFromProto, GenerationParams, getDeprecationReason, isIgnoredField } from "./util";

export class EnumType extends TypeBase<ProtoEnum> {
  get unspecifiedValue(): EnumTypeValue | null {
    return this.valuesWithIgnored.find((v) => v.isUnespecified()) ?? null;
  }

  get values(): EnumTypeValue[] {
    return this.valuesWithIgnored.filter((v) => !v.isIgnored()).filter((v) => !v.isUnespecified());
  }

  get valuesWithIgnored(): EnumTypeValue[] {
    return this.proto.values.map((v) => new EnumTypeValue(v, this.options));
  }
}

export class EnumTypeValue {
  constructor(readonly proto: ProtoEnumValue, private readonly opts: GenerationParams) {}

  get name(): string {
    const prefix = constantCase(this.proto.parent.name);
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
    return this.proto.index === 0 && this.proto.name === `${constantCase(this.proto.parent.name)}_UNSPECIFIED`;
  }

  get number(): number {
    return this.proto.number;
  }
}
