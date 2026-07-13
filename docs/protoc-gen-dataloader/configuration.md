# Configuration Reference

> **EXPERIMENTAL.** Parameter names, defaults, and behavior may change without notice. See the [README](./README.md).

All plugin parameters for protoc-gen-dataloader, passed via `opt` in `buf.gen.yaml` (or `--dataloader_opt` on the protoc CLI).

## Options

### import_prefix

Import path prefix for the protobuf-es v2 generated modules that the loader file imports (service, request schemas, entity schemas).

- **Type:** `string`
- **Default:** `null` (no prefix — imports are written as relative paths from the generated file)

```yaml
opt:
  - import_prefix=../proto
```

Resolved the same way as protoc-gen-pothos's `import_prefix`: relative to each generated file's location, or as a bare module specifier (e.g. a package name) when your protobuf-es output is published as its own package.

### filename_suffix

Output file suffix, appended to the proto file's path (with `.proto` stripped).

- **Type:** `string`
- **Default:** `.pb.dataloader.ts`

```yaml
opt:
  - filename_suffix=.pb.dataloader.ts
```

`proto/example/user_service.proto` generates `example/user_service.pb.dataloader.ts` by default.

### runtime_module

Module specifier that `createRpcLoader` and the `ProtoGraphqlConnectContext` type are imported from.

- **Type:** `string`
- **Default:** `@proto-graphql/connect-runtime`

```yaml
opt:
  - runtime_module=@proto-graphql/connect-runtime
```

Override this if you re-export or vendor the runtime under a different module path.

### format

Run the plugin's in-process dprint formatting pass over the generated TypeScript.

- **Type:** `boolean`
- **Default:** `true`

```yaml
opt:
  - format=true
```

Set to `false` to skip in-plugin formatting when downstream tooling (Biome, Prettier) formats the output anyway.

### emit_imported_files

Generate loaders for `(graphql.rpc).batch` RPCs declared in imported `.proto` files, not just the files being processed directly.

- **Type:** `boolean`
- **Default:** `false`

```yaml
opt:
  - emit_imported_files=true
```

Semantics match protoc-gen-pothos's `emit_imported_files`.

## Complete Example

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  - local: protoc-gen-es
    out: ../src/__generated__/proto
    opt:
      - target=ts

  - local: protoc-gen-dataloader
    out: ../src/__generated__/dataloader
    opt:
      - import_prefix=../proto
      - filename_suffix=.pb.dataloader.ts
      - runtime_module=@proto-graphql/connect-runtime
      - format=true
      - emit_imported_files=false
```
