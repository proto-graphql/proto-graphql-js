import { ProtoFile } from "@proto-graphql/proto-descriptors";
import { GenerationParams } from "./util";

export class DslFile {
  constructor(readonly proto: ProtoFile, readonly options: GenerationParams) {}

  get filename(): string {
    return this.proto.name.replace(/\.proto$/, "_pb_nexus.ts");
  }
}
