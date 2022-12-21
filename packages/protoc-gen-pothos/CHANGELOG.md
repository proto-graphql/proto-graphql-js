# protoc-gen-pothos

## 0.3.1

### Patch Changes

- [#250](https://github.com/proto-graphql/proto-graphql-js/pull/250) [`81b8ead`](https://github.com/proto-graphql/proto-graphql-js/commit/81b8eadbc1c7831bd287e48eb502233ed8126f7e) Thanks [@izumin5210](https://github.com/izumin5210)! - support `(graphql.input_type).ignore` option

- Updated dependencies [[`81b8ead`](https://github.com/proto-graphql/proto-graphql-js/commit/81b8eadbc1c7831bd287e48eb502233ed8126f7e)]:
  - @proto-graphql/codegen-core@0.3.1

## 0.3.0

### Minor Changes

- [#239](https://github.com/proto-graphql/proto-graphql-js/pull/239) [`f072608`](https://github.com/proto-graphql/proto-graphql-js/commit/f0726082c9ad728ff5ad648e79ab7862f85a1a97) Thanks [@izumin5210](https://github.com/izumin5210)! - rewrite protoc-gen-pothos printer with ts-poet

### Patch Changes

- [#243](https://github.com/proto-graphql/proto-graphql-js/pull/243) [`3aa729a`](https://github.com/proto-graphql/proto-graphql-js/commit/3aa729a62a36aa782e8c2153bb3b789e9551ae00) Thanks [@izumin5210](https://github.com/izumin5210)! - remove unused code from codegen-core

- [#241](https://github.com/proto-graphql/proto-graphql-js/pull/241) [`cef3d3e`](https://github.com/proto-graphql/proto-graphql-js/commit/cef3d3e512e616f98869c12060d592c3ff887aa9) Thanks [@izumin5210](https://github.com/izumin5210)! - rewrite protoc-gen-nexus printer with ts-poet

- Updated dependencies [[`3aa729a`](https://github.com/proto-graphql/proto-graphql-js/commit/3aa729a62a36aa782e8c2153bb3b789e9551ae00), [`cef3d3e`](https://github.com/proto-graphql/proto-graphql-js/commit/cef3d3e512e616f98869c12060d592c3ff887aa9), [`f072608`](https://github.com/proto-graphql/proto-graphql-js/commit/f0726082c9ad728ff5ad648e79ab7862f85a1a97)]:
  - @proto-graphql/codegen-core@0.3.0
  - @proto-graphql/protoc-plugin-helpers@0.2.2
  - @proto-graphql/proto-descriptors@0.3.0

## 0.2.3

### Patch Changes

- [#237](https://github.com/proto-graphql/proto-graphql-js/pull/237) [`b9945c8`](https://github.com/proto-graphql/proto-graphql-js/commit/b9945c827e737bda8b85621966a90a2e7e5cdf41) Thanks [@izumin5210](https://github.com/izumin5210)! - tweak input type definition for avoiding type error

- Updated dependencies [[`b9945c8`](https://github.com/proto-graphql/proto-graphql-js/commit/b9945c827e737bda8b85621966a90a2e7e5cdf41)]:
  - @proto-graphql/codegen-core@0.2.3

## 0.2.2

### Patch Changes

- [#234](https://github.com/proto-graphql/proto-graphql-js/pull/234) [`a2a3e60`](https://github.com/proto-graphql/proto-graphql-js/commit/a2a3e60789f75c31c600333afd830a02ac0cccf8) Thanks [@izumin5210](https://github.com/izumin5210)! - support `ProtoScalar` in `ProtoField.type`

- [#236](https://github.com/proto-graphql/proto-graphql-js/pull/236) [`3410d43`](https://github.com/proto-graphql/proto-graphql-js/commit/3410d43a7d29d04e1ed52576ac8a28e9b43cb452) Thanks [@izumin5210](https://github.com/izumin5210)! - add `typeFullName` to extensions in GraphQLField

- Updated dependencies [[`a2a3e60`](https://github.com/proto-graphql/proto-graphql-js/commit/a2a3e60789f75c31c600333afd830a02ac0cccf8)]:
  - @proto-graphql/codegen-core@0.2.2
  - @proto-graphql/proto-descriptors@0.2.0
  - @proto-graphql/protoc-plugin-helpers@0.2.1

## 0.2.1

### Patch Changes

- [#231](https://github.com/proto-graphql/proto-graphql-js/pull/231) [`2ff07a6`](https://github.com/proto-graphql/proto-graphql-js/commit/2ff07a64212a62010330803d05c2f8f7f37f29b4) Thanks [@izumin5210](https://github.com/izumin5210)! - add oroginal protobuf type info to extensions

- [#228](https://github.com/proto-graphql/proto-graphql-js/pull/228) [`c7db053`](https://github.com/proto-graphql/proto-graphql-js/commit/c7db0531f3790dbf61d740440eda841459cb3f6b) Thanks [@izumin5210](https://github.com/izumin5210)! - Support PothosShemaBuilder in external modules

- [#216](https://github.com/proto-graphql/proto-graphql-js/pull/216) [`831f8e7`](https://github.com/proto-graphql/proto-graphql-js/commit/831f8e70ff45d3503413441f568c2c901ae6f552) Thanks [@izumin5210](https://github.com/izumin5210)! - new E2E testing

- Updated dependencies [[`c7db053`](https://github.com/proto-graphql/proto-graphql-js/commit/c7db0531f3790dbf61d740440eda841459cb3f6b)]:
  - @proto-graphql/codegen-core@0.2.1

## 0.2.0

### Minor Changes

- [#224](https://github.com/proto-graphql/proto-graphql-js/pull/224) [`6c25f40`](https://github.com/proto-graphql/proto-graphql-js/commit/6c25f4035f1b788a63bf005dbc52ca5d0bd5f2a2) Thanks [@izumin5210](https://github.com/izumin5210)! - support `long_number` param for mapping 64bit numbers to GraphQL Int

### Patch Changes

- Updated dependencies [[`6c25f40`](https://github.com/proto-graphql/proto-graphql-js/commit/6c25f4035f1b788a63bf005dbc52ca5d0bd5f2a2)]:
  - @proto-graphql/codegen-core@0.2.0
  - @proto-graphql/protoc-plugin-helpers@0.2.0

## 0.1.2

### Patch Changes

- [#217](https://github.com/proto-graphql/proto-graphql-js/pull/217) [`5e2e85b`](https://github.com/proto-graphql/proto-graphql-js/commit/5e2e85baf6e0e21960104d3db30a4e21e04e1627) Thanks [@izumin5210](https://github.com/izumin5210)! - add `eslint-disable` directive to generated files

- [#218](https://github.com/proto-graphql/proto-graphql-js/pull/218) [`c1246c3`](https://github.com/proto-graphql/proto-graphql-js/commit/c1246c3a349f11e3b2bbfd6198c1a06b37270ece) Thanks [@izumin5210](https://github.com/izumin5210)! - fix non-null custom scalar field resolver

- Updated dependencies [[`c1246c3`](https://github.com/proto-graphql/proto-graphql-js/commit/c1246c3a349f11e3b2bbfd6198c1a06b37270ece)]:
  - @proto-graphql/codegen-core@0.1.2

## 0.1.1

### Patch Changes

- [#212](https://github.com/proto-graphql/proto-graphql-js/pull/212) [`ba647eb`](https://github.com/proto-graphql/proto-graphql-js/commit/ba647eb584850fee9c632a76cc1c028ce8ccd725) Thanks [@izumin5210](https://github.com/izumin5210)! - refactor dependencies

- Updated dependencies [[`ba647eb`](https://github.com/proto-graphql/proto-graphql-js/commit/ba647eb584850fee9c632a76cc1c028ce8ccd725), [`c5b988a`](https://github.com/proto-graphql/proto-graphql-js/commit/c5b988a4a1eac5d56d29572b593ae7643e23bd88)]:
  - @proto-graphql/codegen-core@0.1.1
  - @proto-graphql/protoc-plugin-helpers@0.1.1

## 0.1.0

### Minor Changes

- [#200](https://github.com/proto-graphql/proto-graphql-js/pull/200) [`515eabd`](https://github.com/proto-graphql/proto-graphql-js/commit/515eabd2f39baa0a99ae057b1b30a4ccc4149f66) Thanks [@izumin5210](https://github.com/izumin5210)! - support Pothos GraphQL

### Patch Changes

- Updated dependencies [[`515eabd`](https://github.com/proto-graphql/proto-graphql-js/commit/515eabd2f39baa0a99ae057b1b30a4ccc4149f66)]:
  - @proto-graphql/codegen-core@0.1.0
  - @proto-graphql/proto-descriptors@0.1.0
  - @proto-graphql/protoc-plugin-helpers@0.1.0
