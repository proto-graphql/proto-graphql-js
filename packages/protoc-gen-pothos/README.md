# protoc-gen-pothos

Build GraphQL schema from Protobuf and [Pothos GraphQL](https://pothos-graphql.dev/).

## Supported Protocol Buffers Implementations

- [ts-proto](https://github.com/stephenh/ts-proto)

## Configuration with [Buf](https://docs.buf.build/installation)

```yaml
# proto/buf.yaml
version: v1
deps:
  - buf.build/proto-graphql/proto-graphql
```

### with [ts-proto](https://github.com/stephenh/ts-proto)

```yaml
# proto/buf.gen.yaml
version: v1
plugins:
  - name: ts
    out: ../src/__generated__/proto
    strategy: all
    path: ../node_modules/.bin/protoc-gen-ts_proto
    opt:
      - esModuleInterop=true     # required
      - unrecognizedEnum=false   # required
      - outputTypeRegistry=true  # required
    strategy: all
  - name: pothos
    path: ../node_modules/.bin/protoc-gen-pothos
    out: ../src/__generated__/pothos
    opt:
      - pothos_builder_path=../../builder
      - import_prefix=../proto
```

### Supported options

- `import_prefix` (`string`, required)
  - path to out dir of ts-proto
- `pothos_builder_path` (`string`, required)
  - path to file that exports pothos builder
- `emit_imported_files` (`bool`, optional)
  - if `true`, protoc-gen-pothos also emits types defined in imported `.proto` file.
- `custom_type` (`string`, optional)
- `long_number` (`string`, optional, default `String`)
- `ignore_non_message_oneof_fields` (`bool`, optional)

## Author

- Masayuki Izumi ([twitter: @izumin5210](https://github.com/izumin5210), [github: @izumin5210](https://github.com/izumin5210))
