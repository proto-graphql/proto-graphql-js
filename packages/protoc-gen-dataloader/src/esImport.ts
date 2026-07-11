import * as path from "node:path";

import type { DescFile, DescMessage, DescService } from "@bufbuild/protobuf";

/**
 * A small, protobuf-es-v2-only equivalent of protoc-gen-pothos's
 * `protoImportPath` / `protoSchemaSymbol` / `protoTypeSymbol`
 * (packages/protoc-gen-pothos/src/dslgen/printers/util.ts).
 *
 * protoc-gen-dataloader only ever targets protobuf-es v2 (design.md §3 V8,
 * there is no `protobuf_lib` plugin parameter), so this doesn't need pothos's
 * ts-proto / protobuf-es-v1 branches. It also does NOT replicate pothos's
 * full collision-salt name resolution (`resolveProtobufEsDescName`, which
 * handles the rare case where a shape name and a desc name collide within the
 * same proto file) — that algorithm is nontrivial and, if two plugins need
 * it, belongs in a shared place (codegen-core) rather than copied twice.
 * Consolidating this with pothos's copy is future work; see the D3 report.
 */

/** `<import_prefix>/<proto dir>/<name>_pb`, mirroring protoc-gen-es v2 output paths. */
export function protobufEsImportPath(
  file: DescFile,
  importPrefix: string | null,
): string {
  const { dir, name } = path.parse(file.name);
  const importPath = `${dir}/${name}_pb`;
  return `${importPrefix ? `${importPrefix}/` : "./"}${importPath}`.replace(
    /(?<!:)\/\//,
    "/",
  );
}

// Mirrors protobuf-es v2's identifier derivation for the common
// (non-colliding) case: strip the package prefix from the fully-qualified
// type name and join nesting with "_" (e.g. `pkg.Foo.Bar` -> `Foo_Bar`).
function protobufEsLocalName(desc: DescMessage | DescService): string {
  const pkg = desc.file.proto.package ?? "";
  const offset = pkg.length > 0 ? pkg.length + 1 : 0;
  return desc.typeName.substring(offset).replace(/\./g, "_");
}

/** The generated `XxxSchema` const name for a message (protobuf-es v2). */
export function schemaConstName(message: DescMessage): string {
  return `${protobufEsLocalName(message)}Schema`;
}

/** The generated service const name (protobuf-es v2; no `Schema` suffix). */
export function serviceConstName(service: DescService): string {
  return protobufEsLocalName(service);
}
