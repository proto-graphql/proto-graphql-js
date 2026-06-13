import { createRegistry, type Registry } from "@bufbuild/protobuf";
import type { Schema } from "@bufbuild/protoplugin";

// `createRegistryFromSchema` is called once per generated file (see
// protoc-gen-pothos' `generateFiles`), but the registry only depends on
// `schema.allFiles`, which is constant for the whole plugin run. Rebuilding it
// per file made registry construction scale with files^2 and dominated CPU
// profiles on large schemas (`@bufbuild/protobuf` registry/reflect was ~48% of
// self time on a 538-file schema). Memoize by the schema object so the registry
// is built exactly once per run; nothing mutates the registry afterwards, so
// sharing it across files is safe.
const registryCache = new WeakMap<Schema, Registry>();

export function createRegistryFromSchema(schema: Schema): Registry {
  const cached = registryCache.get(schema);
  if (cached !== undefined) return cached;

  const registry = createRegistry(...schema.allFiles);
  registryCache.set(schema, registry);
  return registry;
}
