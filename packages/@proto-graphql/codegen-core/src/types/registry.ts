import {
  createDescriptorSet,
  createRegistryFromDescriptors,
} from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";

export type Registry = ReturnType<typeof createRegistryFromDescriptors>;

export function createRegistryFromSchema(schema: Schema): Registry {
  return createRegistryFromDescriptors(
    createDescriptorSet(schema.proto.protoFile),
  );
}
