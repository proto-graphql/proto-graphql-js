import { ProtoMessage } from "@proto-graphql/proto-descriptors";
import { DslFile } from "./DslFile";
import { ObjectField } from "./ObjectField";
import { ObjectType } from "./ObjectType";
import { OneofUnionType } from "./OneofUnionType";
import { TypeBase } from "./TypeBase";
import { FullName } from "./util";

export class SquashedOneofUnionType extends TypeBase<ProtoMessage> {
  private readonly oneofUnionType: OneofUnionType;
  constructor(proto: ProtoMessage, file: DslFile) {
    super(proto, file);
    this.oneofUnionType = new OneofUnionType(proto.oneofs[0], file);
  }

  get oneofName(): string {
    return this.oneofUnionType.oneofName;
  }

  get fields(): ObjectField<ObjectType>[] {
    return this.oneofUnionType.fields;
  }

  get protoImportPath(): string {
    return this.oneofUnionType.protoImportPath;
  }

  // FIXME: remove
  get parentProtoTypeFullName(): FullName {
    return this.oneofUnionType.parentProtoTypeFullName;
  }

  /**
   * @override
   */
  override get importModules(): { alias: string; module: string; type: "namespace" | "named" }[] {
    return [...super.importModules, ...this.fields.flatMap((f) => f.importModules)];
  }
}
