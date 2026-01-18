import { createRegistry, type Registry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";

export function createRegistryFromSchema(schema: Schema): Registry {
  return createRegistry(...schema.allFiles);
}
