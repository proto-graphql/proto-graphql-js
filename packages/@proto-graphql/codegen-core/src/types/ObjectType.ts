import { ProtoMessage } from "@proto-graphql/proto-descriptors";
import { ObjectField } from "./ObjectField";
import { ObjectOneofField } from "./ObjectOneofField";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";
import { getObjectFieldType } from "./types";
import {
  createProtoFullName,
  FullName,
  isIgnoredField,
  isInputOnlyField,
  modulesWithUniqueImportAlias,
  protoExportAlias,
  protoImportPath,
} from "./util";

export class ObjectType extends TypeBase<ProtoMessage> {
  /**
   * @override
   */
  override get exportTypes(): { name: string; type: FullName }[] {
    return [...super.exportTypes, { name: this.sourceTypeExportAlias, type: this.protoTypeFullName }];
  }

  /**
   * @override
   */
  override get importModules(): { alias: string; module: string }[] {
    return [
      ...super.importModules,
      ...modulesWithUniqueImportAlias([this.protoImportPath]),
      ...this.fields.flatMap((f) => f.importModules),
    ];
  }

  get protoImportPath(): string {
    return protoImportPath(this.proto, this.options);
  }

  get sourceTypeExportAlias(): string {
    return protoExportAlias(this.proto, this.options);
  }

  get protoTypeFullName(): FullName {
    return createProtoFullName(this.proto, this.options);
  }

  get fields(): (ObjectField<any> | ObjectOneofField)[] {
    return [
      ...this.proto.fields
        .filter((f) => f.containingOneof == null)
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((f) => new ObjectField(getObjectFieldType(f, this.options), this, f, this.options)),
      ...this.proto.oneofs
        .filter((f) => !isInputOnlyField(f))
        .filter((f) => !isIgnoredField(f))
        .map((o) => new ObjectOneofField(new OneofUnionType(o, this.file), this, o, this.options)),
    ];
  }
}
