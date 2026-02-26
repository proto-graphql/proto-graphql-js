# @proto-graphql/codegen-core

## 0.6.0

### Minor Changes

- [#465](https://github.com/proto-graphql/proto-graphql-js/pull/465) [`ba30d15`](https://github.com/proto-graphql/proto-graphql-js/commit/ba30d15ab57b1123bda3d9c2396c42d119a31211) Thanks [@izumin5210](https://github.com/izumin5210)! - feat: add support for protobuf-es v2 (`@bufbuild/protobuf` v2.x)

  Use `protobuf_lib=protobuf-es` option. See documentation for details.

- [#455](https://github.com/proto-graphql/proto-graphql-js/pull/455) [`ff7e9a7`](https://github.com/proto-graphql/proto-graphql-js/commit/ff7e9a7d96ca259728d9ebfb12505b51c37f0946) Thanks [@izumin5210](https://github.com/izumin5210)! - **BREAKING**: Remove `fileLayout` option

  The `fileLayout` option has been removed. Previously it allowed choosing between:

  - `proto_file`: One output file per proto file (default)
  - `graphql_type`: Separate output file for each GraphQL type

  The `proto_file` layout is now the only supported behavior.

  **BREAKING CHANGES:**

  - `file_layout` parameter is no longer accepted
  - `fileLayouts` constant is no longer exported from `@proto-graphql/codegen-core`
  - `fileLayout` property has been removed from `PrinterCommonOptions` interface

- [#453](https://github.com/proto-graphql/proto-graphql-js/pull/453) [`5af1791`](https://github.com/proto-graphql/proto-graphql-js/commit/5af1791519e8cdea5938af06133d7dda993779ac) Thanks [@izumin5210](https://github.com/izumin5210)! - Remove unused nexus and google-protobuf/protobufjs support code

  Following the removal of protoc-gen-nexus:

  - Remove `@proto-graphql/proto-descriptors` package
  - Remove `parseNexusOptions` export and `dsl: "nexus"` type
  - Remove `google-protobuf` and `protobufjs` runtime support (pothos only supports `ts-proto` and `protobuf-es`)
  - Remove `use_protobufjs` option

  **BREAKING CHANGES:**

  - `@proto-graphql/proto-descriptors` package has been removed
  - `parseNexusOptions` is no longer exported from `@proto-graphql/protoc-plugin-helpers`
  - `google-protobuf` and `protobufjs` are no longer valid values for `protobuf_lib` option

- [#464](https://github.com/proto-graphql/proto-graphql-js/pull/464) [`b380dbd`](https://github.com/proto-graphql/proto-graphql-js/commit/b380dbd7b6b1c7495f87b221e6393d0e1ebb47db) Thanks [@izumin5210](https://github.com/izumin5210)! - feat!: **BREAKING**: rename `protobuf-es` target to `protobuf-es-v1`

  This prepares for future protobuf-es v2 support.

  **Migration:**

  Update your `buf.gen.yaml` or protoc command:

  ```yaml
  # Before
  opt:
    - protobuf_lib=protobuf-es

  # After
  opt:
    - protobuf_lib=protobuf-es-v1
  ```

### Patch Changes

- [#459](https://github.com/proto-graphql/proto-graphql-js/pull/459) [`ae13852`](https://github.com/proto-graphql/proto-graphql-js/commit/ae138528f87f7a3fbf664c3f7ae33238f233a723) Thanks [@izumin5210](https://github.com/izumin5210)! - chore: upgrade @bufbuild packages to latest versions

  - `@bufbuild/protobuf`: 2.1.0 → 2.10.2
  - `@bufbuild/protoplugin`: 2.1.0 → 2.10.2
  - `@bufbuild/protoc-gen-es`: 2.1.0 → 2.10.2

## 0.5.2

### Patch Changes

- [#417](https://github.com/proto-graphql/proto-graphql-js/pull/417) [`2ae48d1`](https://github.com/proto-graphql/proto-graphql-js/commit/2ae48d1576a15a47f3f1083fb78eec69507d601a) Thanks [@izumin5210](https://github.com/izumin5210)! - use protobuf-es@v2 internally

- [#428](https://github.com/proto-graphql/proto-graphql-js/pull/428) [`e3cee38`](https://github.com/proto-graphql/proto-graphql-js/commit/e3cee38438fbb4c0fbd177566aa75e83e11221ed) Thanks [@izumin5210](https://github.com/izumin5210)! - refactor: migrate protoc plugins to ESM

## 0.5.1

### Patch Changes

- [#371](https://github.com/proto-graphql/proto-graphql-js/pull/371) [`d8be975`](https://github.com/proto-graphql/proto-graphql-js/commit/d8be975c7e716e11cbfc662ab7518020525b75d7) Thanks [@izumin5210](https://github.com/izumin5210)! - build: set `pulic` to `publishConfig.access`

## 0.5.0

### Minor Changes

- [#369](https://github.com/proto-graphql/proto-graphql-js/pull/369) [`967ed0e`](https://github.com/proto-graphql/proto-graphql-js/commit/967ed0e5a5a9d8dea7e7ef46a220cc57048844da) Thanks [@izumin5210](https://github.com/izumin5210)! - support protobuf-es@v1 on protoc-gen-pothos

## 0.4.0

### Minor Changes

- [#330](https://github.com/proto-graphql/proto-graphql-js/pull/330) [`9fd6869`](https://github.com/proto-graphql/proto-graphql-js/commit/9fd6869ead97335506076bcb7086a9d561aa4bb9) Thanks [@izumin5210](https://github.com/izumin5210)! - support bytes

- [#327](https://github.com/proto-graphql/proto-graphql-js/pull/327) [`cb38fa7`](https://github.com/proto-graphql/proto-graphql-js/commit/cb38fa72abf3f1ff2fba0fcfc75d725f63c0ff85) Thanks [@izumin5210](https://github.com/izumin5210)! - support `ignore_non_message_oneof_fields` option

- [#349](https://github.com/proto-graphql/proto-graphql-js/pull/349) [`2b3d87f`](https://github.com/proto-graphql/proto-graphql-js/commit/2b3d87fcc05b3ef6ae7921ef8e72a667ec751159) Thanks [@izumin5210](https://github.com/izumin5210)! - generate protobuf options to graphql extensions

- [#346](https://github.com/proto-graphql/proto-graphql-js/pull/346) [`fa1e455`](https://github.com/proto-graphql/proto-graphql-js/commit/fa1e455561e2ea2a80accf7e80e2ff731e80eac6) Thanks [@izumin5210](https://github.com/izumin5210)! - refactor: use `@bufbuild/protoplugin`

- [#310](https://github.com/proto-graphql/proto-graphql-js/pull/310) [`8f7ad44`](https://github.com/proto-graphql/proto-graphql-js/commit/8f7ad44e56356867a3f95c0d08437d31bc4b8f33) Thanks [@izumin5210](https://github.com/izumin5210)! - support scalar option for define custom scalar type mappings instead of legacy option

  BREAKING CHANGE: drop `long_number` and `custom_type` options

  #### Migration

  `long_number` and `custom_type` can be replaced with `scalar`.

  ```patch
   plugins:
     name: pothos
     out: src/__generated__/schema
     opt:
  -    - long_number=Int
  +    - scalar=int64=Int
  +    - scalar=uint64=Int
  +    - scalar=sint64=Int
  +    - scalar=fixed64=Int
  +    - scalar=sfixed64=Int
  +    - scalar=google.protobuf.Int64Value=Int
  +    - scalar=google.protobuf.UInt64Value=Int
  +    - scalar=google.protobuf.SInt64Value=Int
  +    - scalar=google.protobuf.Fixed64Value=Int
  +    - scalar=google.protobuf.SFixed64Value=Int
  ```

  ```patch
   plugins:
     name: pothos
     out: src/__generated__/schema
     opt:
  -    - custom_type=google.type.Date=Date
  +    - scalar=google.type.Date=Date
  ```

### Patch Changes

- [#354](https://github.com/proto-graphql/proto-graphql-js/pull/354) [`0b532bc`](https://github.com/proto-graphql/proto-graphql-js/commit/0b532bcc1fb21d2364a911d2234bd30449804cb6) Thanks [@izumin5210](https://github.com/izumin5210)! - build with tsup

- [#356](https://github.com/proto-graphql/proto-graphql-js/pull/356) [`1166d7b`](https://github.com/proto-graphql/proto-graphql-js/commit/1166d7bb4e183e06e7964be897a204d864b94381) Thanks [@izumin5210](https://github.com/izumin5210)! - use `jsonName` generated by protoc

## 0.3.5

### Patch Changes

- [#324](https://github.com/proto-graphql/proto-graphql-js/pull/324) [`16b1fac`](https://github.com/proto-graphql/proto-graphql-js/commit/16b1facf48cae5ceb959bf3e81643b7fc58011fc) Thanks [@yyoshiki41](https://github.com/yyoshiki41)! - feat(codegen-code): Add support for getting custom enum names in nameWithParent function

## 0.3.4

### Patch Changes

- [#308](https://github.com/proto-graphql/proto-graphql-js/pull/308) [`5a650c6`](https://github.com/proto-graphql/proto-graphql-js/commit/5a650c6ace5f6132a7dcfd76be8c2c45d84611ab) Thanks [@izumin5210](https://github.com/izumin5210)! - redo the last release

- Updated dependencies [[`5a650c6`](https://github.com/proto-graphql/proto-graphql-js/commit/5a650c6ace5f6132a7dcfd76be8c2c45d84611ab)]:
  - @proto-graphql/proto-descriptors@0.3.3

## 0.3.3

### Patch Changes

- [#294](https://github.com/proto-graphql/proto-graphql-js/pull/294) [`709c7da`](https://github.com/proto-graphql/proto-graphql-js/commit/709c7da021fb503efeaa7ec4a3485fd166204563) Thanks [@izumin5210](https://github.com/izumin5210)! - refer internal dependencies with `workspace:`

- [#295](https://github.com/proto-graphql/proto-graphql-js/pull/295) [`fc4512a`](https://github.com/proto-graphql/proto-graphql-js/commit/fc4512a1db42b7bbc4683e6ad4eb9fbf3a6d24f0) Thanks [@izumin5210](https://github.com/izumin5210)! - fix required custom scalar type of input object field

- Updated dependencies [[`709c7da`](https://github.com/proto-graphql/proto-graphql-js/commit/709c7da021fb503efeaa7ec4a3485fd166204563)]:
  - @proto-graphql/proto-descriptors@0.3.2

## 0.3.2

### Patch Changes

- [#253](https://github.com/proto-graphql/proto-graphql-js/pull/253) [`db7fcec`](https://github.com/proto-graphql/proto-graphql-js/commit/db7fcec7aa987037523388f9fe4ae9b8c3b4c6a4) Thanks [@izumin5210](https://github.com/izumin5210)! - support `emit_imported_files` option

- [#255](https://github.com/proto-graphql/proto-graphql-js/pull/255) [`70295da`](https://github.com/proto-graphql/proto-graphql-js/commit/70295dae5e83a5ee4ee5185e670348c1a88979e2) Thanks [@izumin5210](https://github.com/izumin5210)! - support proto3 optional

- Updated dependencies [[`db7fcec`](https://github.com/proto-graphql/proto-graphql-js/commit/db7fcec7aa987037523388f9fe4ae9b8c3b4c6a4), [`70295da`](https://github.com/proto-graphql/proto-graphql-js/commit/70295dae5e83a5ee4ee5185e670348c1a88979e2)]:
  - @proto-graphql/proto-descriptors@0.3.1

## 0.3.1

### Patch Changes

- [#250](https://github.com/proto-graphql/proto-graphql-js/pull/250) [`81b8ead`](https://github.com/proto-graphql/proto-graphql-js/commit/81b8eadbc1c7831bd287e48eb502233ed8126f7e) Thanks [@izumin5210](https://github.com/izumin5210)! - support `(graphql.input_type).ignore` option

## 0.3.0

### Minor Changes

- [#241](https://github.com/proto-graphql/proto-graphql-js/pull/241) [`cef3d3e`](https://github.com/proto-graphql/proto-graphql-js/commit/cef3d3e512e616f98869c12060d592c3ff887aa9) Thanks [@izumin5210](https://github.com/izumin5210)! - rewrite protoc-gen-nexus printer with ts-poet

- [#239](https://github.com/proto-graphql/proto-graphql-js/pull/239) [`f072608`](https://github.com/proto-graphql/proto-graphql-js/commit/f0726082c9ad728ff5ad648e79ab7862f85a1a97) Thanks [@izumin5210](https://github.com/izumin5210)! - rewrite protoc-gen-pothos printer with ts-poet

### Patch Changes

- [#243](https://github.com/proto-graphql/proto-graphql-js/pull/243) [`3aa729a`](https://github.com/proto-graphql/proto-graphql-js/commit/3aa729a62a36aa782e8c2153bb3b789e9551ae00) Thanks [@izumin5210](https://github.com/izumin5210)! - remove unused code from codegen-core

- Updated dependencies [[`3aa729a`](https://github.com/proto-graphql/proto-graphql-js/commit/3aa729a62a36aa782e8c2153bb3b789e9551ae00), [`cef3d3e`](https://github.com/proto-graphql/proto-graphql-js/commit/cef3d3e512e616f98869c12060d592c3ff887aa9)]:
  - @proto-graphql/proto-descriptors@0.3.0

## 0.2.3

### Patch Changes

- [#237](https://github.com/proto-graphql/proto-graphql-js/pull/237) [`b9945c8`](https://github.com/proto-graphql/proto-graphql-js/commit/b9945c827e737bda8b85621966a90a2e7e5cdf41) Thanks [@izumin5210](https://github.com/izumin5210)! - tweak input type definition for avoiding type error

## 0.2.2

### Patch Changes

- [#234](https://github.com/proto-graphql/proto-graphql-js/pull/234) [`a2a3e60`](https://github.com/proto-graphql/proto-graphql-js/commit/a2a3e60789f75c31c600333afd830a02ac0cccf8) Thanks [@izumin5210](https://github.com/izumin5210)! - support `ProtoScalar` in `ProtoField.type`

- Updated dependencies [[`a2a3e60`](https://github.com/proto-graphql/proto-graphql-js/commit/a2a3e60789f75c31c600333afd830a02ac0cccf8)]:
  - @proto-graphql/proto-descriptors@0.2.0

## 0.2.1

### Patch Changes

- [#228](https://github.com/proto-graphql/proto-graphql-js/pull/228) [`c7db053`](https://github.com/proto-graphql/proto-graphql-js/commit/c7db0531f3790dbf61d740440eda841459cb3f6b) Thanks [@izumin5210](https://github.com/izumin5210)! - Support PothosShemaBuilder in external modules

## 0.2.0

### Minor Changes

- [#224](https://github.com/proto-graphql/proto-graphql-js/pull/224) [`6c25f40`](https://github.com/proto-graphql/proto-graphql-js/commit/6c25f4035f1b788a63bf005dbc52ca5d0bd5f2a2) Thanks [@izumin5210](https://github.com/izumin5210)! - support `long_number` param for mapping 64bit numbers to GraphQL Int

## 0.1.2

### Patch Changes

- [#218](https://github.com/proto-graphql/proto-graphql-js/pull/218) [`c1246c3`](https://github.com/proto-graphql/proto-graphql-js/commit/c1246c3a349f11e3b2bbfd6198c1a06b37270ece) Thanks [@izumin5210](https://github.com/izumin5210)! - fix non-null custom scalar field resolver

## 0.1.1

### Patch Changes

- [#212](https://github.com/proto-graphql/proto-graphql-js/pull/212) [`ba647eb`](https://github.com/proto-graphql/proto-graphql-js/commit/ba647eb584850fee9c632a76cc1c028ce8ccd725) Thanks [@izumin5210](https://github.com/izumin5210)! - refactor dependencies

## 0.1.0

### Minor Changes

- [#200](https://github.com/proto-graphql/proto-graphql-js/pull/200) [`515eabd`](https://github.com/proto-graphql/proto-graphql-js/commit/515eabd2f39baa0a99ae057b1b30a4ccc4149f66) Thanks [@izumin5210](https://github.com/izumin5210)! - support Pothos GraphQL

### Patch Changes

- Updated dependencies [[`515eabd`](https://github.com/proto-graphql/proto-graphql-js/commit/515eabd2f39baa0a99ae057b1b30a4ccc4149f66)]:
  - @proto-graphql/proto-descriptors@0.1.0
