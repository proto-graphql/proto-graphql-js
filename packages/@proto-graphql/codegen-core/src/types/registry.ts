// export type Registry = ReturnType<typeof

import {
  createDescriptorSet,
  createRegistryFromDescriptors,
} from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";

export type Registry = ReturnType<typeof createRegistryFromSchema>;

export function createRegistryFromSchema(schema: Schema) {
  return createRegistryFromDescriptors(
    createDescriptorSet(schema.proto.protoFile),
  );
}
