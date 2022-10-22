import { ProtoFile } from "@proto-graphql/proto-descriptors";
import { GenerationParams } from "./util";

export class DslFile {
  constructor(readonly proto: ProtoFile, readonly options: GenerationParams & { dsl: "nexus" | "pothos" }) {}

  get filename(): string {
    return this.proto.name.replace(/\.proto$/, this.extname);
  }

  get extname(): string {
    return extnames[this.options.dsl][this.options.fileLayout];
  }
}

const extnames: Record<"nexus" | "pothos", Record<GenerationParams["fileLayout"], string>> = {
  nexus: {
    proto_file: "_pb_nexus.ts",
    graphql_type: ".nexus.ts",
  },
  pothos: {
    proto_file: ".pb.pothos.ts",
    graphql_type: ".pothos.ts",
  },
};
