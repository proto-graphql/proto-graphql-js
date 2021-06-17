import { constantCase } from "change-case";
import { ProtoEnum, ProtoEnumValue } from "../../protogen";
import {
  createProtoFullName,
  FullName,
  GenerationParams,
  getDeprecationReason,
  isIgnoredField,
  protoImportPath,
  descriptionFromProto,
} from "./util";
import { TypeBase } from "./TypeBase";

export class EnumType extends TypeBase<ProtoEnum> {
  get protoImportPath(): string {
    return protoImportPath(this.proto, this.options);
  }

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
  constructor(private readonly proto: ProtoEnumValue, private readonly opts: GenerationParams) {}

  get name(): string {
    return this.proto.name;
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

  get fullName(): FullName {
    return [createProtoFullName(this.proto.parent, this.opts), this.proto.name];
  }

  public isUnespecified(): boolean {
    return this.proto.index === 0 && this.proto.name === `${constantCase(this.proto.parent.name)}_UNSPECIFIED`;
  }

  get number(): number {
    return this.proto.number;
  }
}
