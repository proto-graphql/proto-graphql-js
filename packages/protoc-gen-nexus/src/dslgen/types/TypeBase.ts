import path from "path";
import { ProtoEnum, ProtoMessage, ProtoOneof } from "../../protogen";
import { FullName, GenerationParams, gqlTypeName, modulesWithUniqueImportAlias, descriptionFromProto } from "./util";
import { DslFile } from "./DslFile";

export abstract class TypeBase<P extends ProtoMessage | ProtoEnum | ProtoOneof> {
  constructor(readonly proto: P, readonly file: DslFile) {}

  get typeName(): string {
    return gqlTypeName(this.proto);
  }

  get description(): string | null {
    return descriptionFromProto(this.proto);
  }

  get exportTypes(): { name: string; type: FullName }[] {
    return [];
  }

  get importModules(): { alias: string; module: string }[] {
    return modulesWithUniqueImportAlias(["nexus"]);
  }

  get filename(): string {
    switch (this.options.fileLayout) {
      case "proto_file":
        return this.file.filename;
      case "graphql_type": {
        return path.join(path.dirname(this.file.filename), `${this.typeName}.nexus.ts`);
      }
      /* istanbul ignore next */
      default: {
        const _exhaustiveCheck: never = this.options.fileLayout;
        throw "unreachable";
      }
    }
  }

  protected get options(): GenerationParams {
    return this.file.options;
  }
}
