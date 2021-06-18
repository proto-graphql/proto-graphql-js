import { ProtoMessage } from "../../protogen";
import { EnumType } from "./EnumType";
import { InputObjectField } from "./InputObjectField";
import { ScalarType } from "./ScalarType";
import { TypeBase } from "./TypeBase";
import { getInputObjectFieldType } from "./types";
import { createProtoFullName, FullName, gqlTypeName, isIgnoredField, isOutputOnlyField } from "./util";

export class InputObjectType extends TypeBase<ProtoMessage> {
  /**
   * @override
   */
  override get typeName(): string {
    return `${gqlTypeName(this.proto)}Input`;
  }

  get protoTypeFullName(): FullName {
    return createProtoFullName(this.proto, this.options);
  }

  get fields(): InputObjectField<ScalarType | EnumType | InputObjectType>[] {
    return [
      ...this.proto.fields
        .filter((f) => !isOutputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((f) => new InputObjectField(getInputObjectFieldType(f, this.options), this, f, this.options)),
    ];
  }

  /**
   * @override
   */
  override get importModules(): { alias: string; module: string }[] {
    return [...super.importModules, ...this.fields.flatMap((f) => f.importModules)];
  }

  public toPartialInput(): InputObjectType {
    return new PartialInputObjectType(this.proto, this.file);
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
