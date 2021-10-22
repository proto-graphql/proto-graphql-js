
## v0.5.0-alpha.19 (2021-10-22)

#### Features - Code Generation
* `proto-nexus`, `protoc-gen-nexus`
  * [#169](https://github.com/proto-graphql/proto-nexus/pull/169) Generate proto metadata as extensions ([@izumin5210](https://github.com/izumin5210))

#### Improvements - Code Generation
* `@proto-nexus/google-protobuf`, `@proto-nexus/protobufjs`, `proto-nexus`, `protoc-gen-nexus`
  * [#155](https://github.com/proto-graphql/proto-nexus/pull/155) Validate parseInt results for 64bit number fields ([@izumin5210](https://github.com/izumin5210))

#### Dependencies
* [#161](https://github.com/proto-graphql/proto-nexus/pull/161) build(deps): bump tar from 4.4.15 to 4.4.19 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#164](https://github.com/proto-graphql/proto-nexus/pull/164) build(deps): bump tmpl from 1.0.4 to 1.0.5 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))

## v0.5.0-alpha.18 (2021-08-10)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#144](https://github.com/proto-graphql/proto-nexus/pull/144) feat: support `graphql.field.(output|input|partial_input)_nullability` ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.17 (2021-08-05)

#### ⚠️ Breaking Changes - Code Generation
* `protoc-gen-nexus`
  * [#142](https://github.com/proto-graphql/proto-nexus/pull/142) feat: trim prefix from enum value names ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.16 (2021-08-02)

#### Features - Code Generation
* `@proto-nexus/google-protobuf`, `@proto-nexus/protobufjs`, `@testapis/proto`, `proto-nexus`, `protoc-gen-nexus`
  * [#140](https://github.com/proto-graphql/proto-nexus/pull/140) support custom scalar ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.15 (2021-06-29)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#134](https://github.com/proto-graphql/proto-nexus/pull/134) feat: support `(graphql.input_type).no_partial` option ([@izumin5210](https://github.com/izumin5210))

#### Dependencies
* `protoc-gen-nexus`
  * [#133](https://github.com/proto-graphql/proto-nexus/pull/133) chore(deps): update dependency nexus to v1.1.0 ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.14 (2021-06-18)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#131](https://github.com/proto-graphql/proto-nexus/pull/131) fix: generate partial inputs for all input types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.13 (2021-06-18)

#### ⚠️ Breaking Changes - Code Generation
* `protoc-gen-nexus`
  * [#130](https://github.com/proto-graphql/proto-nexus/pull/130) fix: make optional repeated field are nullable ([@izumin5210](https://github.com/izumin5210))

#### Features - Code Generation
* `protoc-gen-nexus`
  * [#129](https://github.com/proto-graphql/proto-nexus/pull/129) feat: support `partial_inputs` param to generate input objects where al… ([@izumin5210](https://github.com/izumin5210))

#### Dependencies
* Other
  * [#121](https://github.com/proto-graphql/proto-nexus/pull/121) chore(deps): update dependency graphql-scalars to v1.10.0 ([@renovate[bot]](https://github.com/apps/renovate))
* `@testapis/node-native`, `protoc-gen-nexus`
  * [#117](https://github.com/proto-graphql/proto-nexus/pull/117) chore(deps): pin dependencies ([@renovate[bot]](https://github.com/apps/renovate))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.12 (2021-04-15)

#### Features - Code Generation
* `@proto-nexus/proto-fields-plugin`, `protoc-gen-nexus`
  * [#107](https://github.com/proto-graphql/proto-nexus/pull/107) feat: @proto-nexus/proto-fields-plugin ([@izumin5210](https://github.com/izumin5210))

#### Bug Fixes
* `@testapis/proto`, `protoc-gen-nexus`
  * [#108](https://github.com/proto-graphql/proto-nexus/pull/108) fix: import parent message of squashed oneof union ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.11 (2021-02-22)

#### ⚠️ Breaking Changes - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#105](https://github.com/proto-graphql/proto-nexus/pull/105) feat: generate noop fields when types have no fields ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.10 (2021-02-20)

#### ⚠️ Breaking Changes - Code Generation
* `@proto-nexus/google-protobuf`, `@proto-nexus/protobufjs`, `protoc-gen-nexus`
  * [#102](https://github.com/proto-graphql/proto-nexus/pull/102) feat: Make list items are non-nullable ([@izumin5210](https://github.com/izumin5210))

#### Features - Code Generation
* `@proto-nexus/google-protobuf`, `@proto-nexus/protobufjs`, `protoc-gen-nexus`
  * [#104](https://github.com/proto-graphql/proto-nexus/pull/104) generate toProto func for input object types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.9 (2021-02-06)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#101](https://github.com/proto-graphql/proto-nexus/pull/101) feat: support graphql.object_type.name for overriding type names ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.8 (2021-02-05)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#100](https://github.com/proto-graphql/proto-nexus/pull/100) fix: reference types with string in proto_file layout ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.7 (2021-02-05)

#### Bug Fixes
* `@testapis/proto`, `protoc-gen-nexus`
  * [#99](https://github.com/proto-graphql/proto-nexus/pull/99) fix: error in repeated squashed union resolver ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.6 (2021-02-04)

#### Improvements - Code Generation
* `protoc-gen-nexus`
  * [#98](https://github.com/proto-graphql/proto-nexus/pull/98) fix: stop generating unused imports ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.5 (2021-02-04)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#97](https://github.com/proto-graphql/proto-nexus/pull/97) fix: import parent object type definition for oneof unions ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.4 (2021-02-01)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#96](https://github.com/proto-graphql/proto-nexus/pull/96) fix: union type import path bug on file_layout=graphql_type ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.3 (2021-02-01)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#95](https://github.com/proto-graphql/proto-nexus/pull/95) fix: import path bug ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.2 (2021-01-31)

#### Features - Code Generation
* `protoc-gen-nexus`
  * [#94](https://github.com/proto-graphql/proto-nexus/pull/94) feat: support file_layout option and generating files per-graphql-types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.5.0-alpha.1 (2021-01-26)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#93](https://github.com/proto-graphql/proto-nexus/pull/93) feat: Support graphql.field.skip_resolver option ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.6 (2021-01-24)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#86](https://github.com/proto-graphql/proto-nexus/pull/86) Add graphql.schema.ignore option ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.5 (2021-01-24)

#### Bug Fixes
* `@testapis/proto`, `protoc-gen-nexus`
  * [#85](https://github.com/proto-graphql/proto-nexus/pull/85) fix: convert values within map function in repeated scalars ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.4 (2021-01-22)

#### Bug Fixes
* `@testapis/proto`, `protoc-gen-nexus`
  * [#84](https://github.com/proto-graphql/proto-nexus/pull/84) fix guard clauses for repeated enums ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.3 (2021-01-07)

#### Bug Fixes
* `protoc-gen-nexus`
  * [#81](https://github.com/proto-graphql/proto-nexus/pull/81) skip sourceType for interface types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.2 (2021-01-07)

#### ⚠️ Breaking Changes - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#79](https://github.com/proto-graphql/proto-nexus/pull/79)  ignore oneof union types when parent message is ignored ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.1 (2021-01-07)

#### ⚠️ Breaking Changes - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#77](https://github.com/proto-graphql/proto-nexus/pull/77) fix: do not ignore nested types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.4.0 (2021-01-07)

#### ⚠️ Breaking Changes - Code Generation
* `protoc-gen-nexus`
  * [#74](https://github.com/proto-graphql/proto-nexus/pull/74) feat: depends on isTypeOf abstraction strategy ([@izumin5210](https://github.com/izumin5210))
  * [#70](https://github.com/proto-graphql/proto-nexus/pull/70) Camelize oneof-union name ([@izumin5210](https://github.com/izumin5210))

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#76](https://github.com/proto-graphql/proto-nexus/pull/76) support interface ([@izumin5210](https://github.com/izumin5210))
  * [#71](https://github.com/proto-graphql/proto-nexus/pull/71) consider graphql.field.ignore option for oneof members ([@izumin5210](https://github.com/izumin5210))

#### Improvements - Code Generation
* `protoc-gen-nexus`
  * [#75](https://github.com/proto-graphql/proto-nexus/pull/75) simplify nexus import ([@izumin5210](https://github.com/izumin5210))
  * [#69](https://github.com/proto-graphql/proto-nexus/pull/69) omit empty descriptions ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.3.0 (2021-01-03)

#### ⚠️ Breaking Changes - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#65](https://github.com/proto-graphql/proto-nexus/pull/65)  integrate graphql.object_type.ignore and grahpql.input_type.ignore ([@izumin5210](https://github.com/izumin5210))

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#64](https://github.com/proto-graphql/proto-nexus/pull/64) support `graphql.field.name` option ([@izumin5210](https://github.com/izumin5210))
  * [#60](https://github.com/proto-graphql/proto-nexus/pull/60) support `graphql.object_type.squash_union` option ([@izumin5210](https://github.com/izumin5210))

#### Improvements - Code Generation
* `protoc-gen-nexus`
  * [#62](https://github.com/proto-graphql/proto-nexus/pull/62) reduce non-null assertion from generated code ([@izumin5210](https://github.com/izumin5210))

#### Bug Fixes
* `protoc-gen-nexus`
  * [#57](https://github.com/proto-graphql/proto-nexus/pull/57) fix bugs in enum field resolvers ([@izumin5210](https://github.com/izumin5210))
* `@testapis/proto`, `protoc-gen-nexus`
  * [#56](https://github.com/proto-graphql/proto-nexus/pull/56) do not consdier graphql.object_type.ignore for input types ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.2.2 (2020-12-29)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#55](https://github.com/proto-graphql/proto-nexus/pull/55) support graphql.schema.ignore_{requests,responses} options ([@izumin5210](https://github.com/izumin5210))
  * [#54](https://github.com/proto-graphql/proto-nexus/pull/54) support graphql.(object,input,enum}_type.ignore option ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.2.1 (2020-12-29)

#### Features - Code Generation
* `@testapis/proto`, `protoc-gen-nexus`
  * [#52](https://github.com/proto-graphql/proto-nexus/pull/52) Support graphql.(oneof|enum_value).ignore ([@izumin5210](https://github.com/izumin5210))
  * [#50](https://github.com/proto-graphql/proto-nexus/pull/50) support referencing other packages ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))


## v0.2.0 (2020-12-28)

#### ⚠️ Breaking Changes - Code Generation
* `@testapis/nexus-native`, `@testapis/nexus`, `@testapis/node-native`, `@testapis/node`, `@testapis/proto`, `protoc-gen-nexus`
  * [#42](https://github.com/proto-graphql/proto-nexus/pull/42) ignore `<ENUM_NAME>_UNSPECIFIED` value ([@izumin5210](https://github.com/izumin5210))

#### Features - Code Generation
* `@testapis/node-native`, `@testapis/node`, `@testapis/proto`, `protoc-gen-nexus`
  * [#41](https://github.com/proto-graphql/proto-nexus/pull/41) graphql.field.ignore option ([@izumin5210](https://github.com/izumin5210))
* `@proto-nexus/protobufjs-adapter`, `@testapis/nexus-native`, `@testapis/nexus`, `@testapis/node-native`, `@testapis/node`, `@testapis/proto`, `protoc-gen-nexus`
  * [#39](https://github.com/proto-graphql/proto-nexus/pull/39) Support protobuf.js ([@izumin5210](https://github.com/izumin5210))

#### Committers: 1
- Masayuki Izumi ([@izumin5210](https://github.com/izumin5210))
