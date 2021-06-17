import { ProtoMessage } from "../../protogen";
import { EnumType } from "./EnumType";
import { InputObjectField } from "./InputObjectField";
import { ScalarType } from "./ScalarType";
import { TypeBase } from "./TypeBase";
import { createProtoFullName, FullName, gqlTypeName, isIgnoredField, isOutputOnlyField } from "./util";
import { getInputObjectFieldType } from "./types";

export class InputObjectType extends TypeBase<ProtoMessage> {
  /**
   * @override
   */
  get typeName(): string {
    return gqlTypeName(this.proto, { input: true });
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
  get importModules(): { alias: string; module: string }[] {
    return [...super.importModules, ...this.fields.flatMap((f) => f.importModules)];
  }
}
