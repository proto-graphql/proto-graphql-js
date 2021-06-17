import assert from "assert";
import { ProtoOneof } from "../../protogen";
import { createProtoFullName, FullName, isIgnoredField, isInputOnlyField, protoImportPath } from "./util";
import { TypeBase } from "./TypeBase";
import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { getObjectFieldType } from "./types";

export class OneofUnionType extends TypeBase<ProtoOneof> {
  get fields(): ObjectField<ObjectType>[] {
    return this.proto.fields
      .filter((f) => !isIgnoredField(f))
      .filter((f) => !isInputOnlyField(f))
      .map((f) => {
        const type = getObjectFieldType(f, this.options);
        // FIXME: raise user-friendly error
        assert(type instanceof ObjectType);
        return new ObjectField(type, this, f, this.options);
      });
  }

  get oneofName(): string {
    return this.proto.name;
  }

  get protoImportPath(): string {
    return protoImportPath(this.proto.parent, this.options);
  }

  // FIXME: remove
  get parentProtoTypeFullName(): FullName {
    return createProtoFullName(this.proto.parent, this.options);
  }

  /**
   * @override
   */
  override get importModules(): { alias: string; module: string }[] {
    return [...super.importModules, ...this.fields.flatMap((f) => f.importModules)];
  }
}
