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
- `scalar` (`string`, optional)

  - add scalar mapping
  - default:
    - Protobuf's 64-bit integer types to `String`
    - Protobuf's bytes type to `Bytes`
    - `google.protobuf.Timestamp` to `DateTime`
  - e.g.
    - Map `google.type.Date` to `Date`
      - ```yaml
        opt:
          - scalar=google.type.Date=Date
        ```
        opt:
    - Map Protobuf's 64-bit integer types to `BigInt`
      - ```yaml
        opt:
          - scalar=int64=BigInt
          - scalar=uint64=BigInt
          - scalar=sint64=BigInt
          - scalar=fixed64=BigInt
          - scalar=sfixed64=BigInt
          - scalar=google.protobuf.Int64Value=BigInt
          - scalar=google.protobuf.UInt64Value=BigInt
          - scalar=google.protobuf.SInt64Value=BigInt
          - scalar=google.protobuf.Fixed64Value=BigInt
          - scalar=google.protobuf.SFixed64Value=BigInt
        ```

## Author

- Masayuki Izumi ([twitter: @izumin5210](https://github.com/izumin5210), [github: @izumin5210](https://github.com/izumin5210))
