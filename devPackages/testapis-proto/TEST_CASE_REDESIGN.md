# testapis-proto Golden Test Case Redesign (from scratch)

## 1. Scope and goals
- Goal: redesign all `.proto` test fixtures used by golden tests under `devPackages/testapis-proto/proto/testapis/` from scratch.
- Constraint: assume all current cases are removed.
- Primary targets:
  - `proto-graphql` type/field mapping behavior
  - runtime differences (`ts-proto`, `protobuf-es-v1`, `protobuf-es`)
  - import resolution behavior in generated code (`protobuf-es`, `protoc-gen-pothos`)
  - option handling (`graphql.*` extensions and plugin params)

## 2. Redesign principles
- One concern per package: do not mix many orthogonal concerns in one package.
- Imports are explicit test axes: same package and cross-package are independent cases.
- Runtime-sensitive behavior must have dedicated cases (not hidden inside unrelated packages).
- Keep each package minimal but complete: include only fields/types needed for that scenario.
- File and package names must be stable and intention-revealing.

## 3. Patterns to cover

### 3.1 Import topology patterns
1. Same directory, different file import:
- message type import
- enum type import
- oneof member type import

2. Same package, different subdirectory import:
- nested path import with `prefixMatch=true`
- ensure output file path and intra-generated import path are correct

3. Different package import:
- message import
- enum import
- nested message import
- nested enum import

4. Different package with same local type names:
- import symbol collision handling in generated TS code

5. Squashed union imported from other package:
- union member types imported transitively

6. Transitive imports (`A -> B -> C`):
- generated code for A compiles with only A in `file_to_generate`

7. `emit_imported_files=true` behavior:
- imported `.proto` also emitted intentionally

### 3.2 Type mapping and runtime patterns
1. Primitive scalars + repeated scalars
2. bytes + repeated bytes
3. 64bit scalar mapping differences (`String` vs `Int`) by runtime variant
4. well-known types:
- `google.protobuf.Timestamp`
- wrappers (`Int32Value`, `Int64Value`, `UInt64Value`, `StringValue`, `BytesValue`)
5. enum unspecified handling (`*_UNSPECIFIED` skip)
6. enum without unspecified (0 value kept)
7. nested message/enum mapping
8. proto3 optional presence

### 3.3 oneof and union patterns
1. message-only oneof (required/optional)
2. oneof member in separate file
3. oneof with non-message members:
- default: generation error
- `ignore_non_message_oneof_fields=true`: generation success
4. squashed union (`(graphql.object_type).squash_union = true`)

### 3.4 GraphQL extension option patterns
1. file options:
- `(graphql.schema).type_prefix`
- `(graphql.schema).ignore`
- `(graphql.schema).ignore_requests`
- `(graphql.schema).ignore_responses`

2. message options:
- `(graphql.object_type).ignore`
- `(graphql.object_type).interface`
- `(graphql.object_type).name`
- `(graphql.input_type).ignore`
- `(graphql.input_type).no_partial`

3. field options:
- `(graphql.field).ignore`
- `(graphql.field).name`
- `(graphql.field).id`
- `(graphql.field).skip_resolver`
- nullability overrides (`output/input/partial_input`)

4. oneof options:
- `(graphql.oneof).ignore`

5. enum options:
- `(graphql.enum_type).ignore`
- `(graphql.enum_type).name`
- `(graphql.enum_value).ignore`

### 3.5 Comment-derived behavior patterns
1. `Required.`
2. `Output only.`
3. `Input only.`
4. mixed order comments (`Output only. Required.` etc.)

### 3.6 Deprecation patterns
1. file deprecation
2. message deprecation
3. field deprecation
4. enum deprecation
5. enum value deprecation
6. oneof deprecation (all members deprecated)

## 4. New proto package layout

```text
devPackages/testapis-proto/proto/testapis/
  basic/
    scalars.proto
    enums.proto
    nested.proto
    empty.proto
    presence.proto
    wktypes.proto
  behavior/
    field_comments.proto
  options/
    schema.proto
    message_and_field.proto
    field_nullability.proto
    input_no_partial.proto
    deprecation.proto
  oneof/
    message_only.proto
    non_message.proto
  imports/
    same_dir/
      base.proto
      consumer.proto
    same_pkg_subdir/
      common/types.proto
      feature/consumer.proto
    cross_pkg_a/
      types.proto
    cross_pkg_b/
      consumer.proto
    symbol_collision/a.proto
    symbol_collision/b.proto
    symbol_collision/consumer.proto
    oneof_cross_file/
      member.proto
      parent.proto
    squashed_union/pkg1.proto
    squashed_union/pkg2.proto
    transitive/a.proto
    transitive/b.proto
    transitive/c.proto
```

## 5. Package-by-package design

1. `testapis.basic.scalars`
- primitives, repeated primitives, bytes, repeated bytes
- includes one message for field resolver behavior (`nullable/non-null`)

2. `testapis.basic.enums`
- enum with `_UNSPECIFIED`
- enum without `_UNSPECIFIED`
- enum field + repeated enum field

3. `testapis.basic.nested`
- nested message and nested enum in parent

4. `testapis.basic.empty`
- empty message (noop field generation path)

5. `testapis.basic.presence`
- proto3 optional scalar
- optional message field

6. `testapis.basic.wktypes`
- timestamp + wrapper types (including int64 wrappers and bytes wrapper)

7. `testapis.behavior.field_comments`
- comment-based Required/Input only/Output only combinations

8. `testapis.options.schema`
- `type_prefix`, `ignore_requests`, `ignore_responses`, file-level `ignore`
- include service request/response messages for ignore behavior

9. `testapis.options.message_and_field`
- object/input/enum/enum_value/oneof/field options
- include `id`, `name`, `skip_resolver`, `interface`, `squash_union`

10. `testapis.options.field_nullability`
- explicit nullability override fields for output/input/partial

11. `testapis.options.input_no_partial`
- message with both partial-able and `no_partial=true` nested input messages

12. `testapis.options.deprecation`
- file/message/field/enum/enum value/oneof deprecations

13. `testapis.oneof.message_only`
- required and optional message oneof

14. `testapis.oneof.non_message`
- oneof including scalar + enum + message for `ignore_non_message_oneof_fields`

15. `testapis.imports.same_dir`
- same-dir cross-file import (message + enum)

16. `testapis.imports.same_pkg_subdir`
- same-package, different subdirectory import (requires `prefixMatch=true`)

17. `testapis.imports.cross_pkg_b`
- imports from `cross_pkg_a` (message/enum/nested types)

18. `testapis.imports.symbol_collision`
- imports two same-name messages from different packages/files

19. `testapis.imports.oneof_cross_file`
- oneof members defined in separate file

20. `testapis.imports.squashed_union`
- squashed union imported across package boundary

21. `testapis.imports.transitive`
- transitive import chain A->B->C

## 6. Golden test matrix redesign

### 6.1 Default runtime variants (`ts-proto`, `protobuf-es-v1`, `protobuf-es`)
- `testapis.basic.scalars`
- `testapis.basic.enums`
- `testapis.basic.nested`
- `testapis.basic.empty`
- `testapis.basic.presence`
- `testapis.basic.wktypes`
- `testapis.behavior.field_comments`
- `testapis.options.schema`
- `testapis.options.message_and_field`
- `testapis.options.field_nullability`
- `testapis.options.input_no_partial`
- `testapis.options.deprecation`
- `testapis.oneof.message_only`
- `testapis.imports.same_dir`
- `testapis.imports.cross_pkg_b`
- `testapis.imports.oneof_cross_file`
- `testapis.imports.squashed_union` (`prefixMatch=true`)
- `testapis.imports.transitive`

### 6.2 Option-specific runtime variants
1. `ts-proto-partial-inputs`
- package: `testapis.options.message_and_field`
- additional params: `partial_inputs`

2. `ts-proto-forcelong`
- packages:
  - `testapis.basic.scalars`
  - `testapis.basic.wktypes`
- validate 64bit mapping differences

3. `protobuf-es-v1` + `protobuf-es` with `emit_imported_files`
- package: `testapis.imports.cross_pkg_b`
- additional params: `emit_imported_files`

4. `protobuf-es-v1` + `protobuf-es` with `ignore_non_message_oneof_fields`
- package: `testapis.oneof.non_message`
- additional params: `ignore_non_message_oneof_fields`

5. Error-path case (separate non-golden test)
- `testapis.oneof.non_message` without `ignore_non_message_oneof_fields`
- assert generation fails with expected error message

## 7. Cases intentionally removed from current fixtures
- `custom_types/*` as standalone package
  - replaced by explicit scalar mapping and import cases in `options`/`imports`
- current mixed `extensions/extensions.proto` mega-case
  - split into `options.schema`, `options.message_and_field`, `options.field_nullability`, `options.input_no_partial`
- current `multipkgs` typo-like package inconsistency
  - replaced by explicit cross-package import packages with clear boundaries

## 8. Migration procedure
1. Delete existing `devPackages/testapis-proto/proto/testapis/**`.
2. Add new package/file structure above.
3. Regenerate descriptor bins (`pnpm --filter @proto-graphql/testapis-proto gen`).
4. Regenerate test APIs (`pnpm gen:testapis`).
5. Rebuild golden fixtures by runtime variant.
6. Update package names in unit tests using `TestapisPackage`.
7. Add non-golden failure tests for explicit error-path cases.

## 9. Expected benefits
- Better fault isolation: one failing case maps to one feature family.
- Stronger regression detection for import path and runtime differences.
- Easier maintenance: no monolithic extension fixture.
- Clearer onboarding: package names directly describe intent.
