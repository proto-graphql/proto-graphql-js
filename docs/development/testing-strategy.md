# Testing Strategy

## Purpose

Testing in this repository is designed to continuously guarantee the following:

- Regression detection in code generation logic
- Type safety of generated TypeScript code
- Consistency between generated code, GraphQL schema, and GraphQL execution results
- Safe releases across a multi-package repository with dependency constraints

## Testing Layers

| Layer | Primary Target | Main Location |
|---|---|---|
| Unit Test | String generation, printers, helper logic | `packages/**/src/**/*.test.ts`, `packages/**/src/**/__tests__/` |
| Golden Test | `protoc-gen-pothos` generation output, type checks, GraphQL behavior | `packages/protoc-gen-pothos/src/__tests__/golden/`, `tests/golden/` |
| Workspace Test Orchestration | Full monorepo test execution | `pnpm test` (`turbo run test`) |

## Code Generation CLI Testing Principles

For code generation CLIs such as `protoc-gen-pothos`, tests should use **golden file tests as the default strategy**.

- Test cases should be designed to be as MECE as practical (single concern per package, minimal overlap)
- Non-golden unit tests should be kept to a minimum
- Add unit tests only for logic that cannot be directly covered by golden tests (for example: path normalization, error formatting, helper boundary behavior)

## Execution Policy

- Run all tests: `pnpm test`
- Run only `protoc-gen-pothos`: `pnpm --dir packages/protoc-gen-pothos test`
- Run only Golden Tests: `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts`
- Update snapshots: `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts -u`

In `turbo.json`, the `test` task depends on `^build`.
This ensures tests run against built dependency packages and generated test API artifacts.

## Golden Test Specification (`protoc-gen-pothos`)

### Directory Convention

Test cases are managed in this two-level structure:

```text
tests/golden/<runtime-variant>/<proto-package>/
```

Examples:

- `tests/golden/ts-proto/testapis.basic.enums/`
- `tests/golden/ts-proto-forcelong/testapis.basic.scalars/`
- `tests/golden/protobuf-es-v1/testapis.options.deprecation/`

### What Each Test Case Validates

`packages/protoc-gen-pothos/src/__tests__/golden/golden.test.ts` runs the following checks per discovered case:

1. Code generation (`protocGenPothos.run`) and generated file snapshot comparison
2. Type checking with per-case `tsconfig.json` (TypeScript Compiler API)
3. Type error snapshot comparison (`__expected__/type-errors.txt`)
4. GraphQL SDL snapshot comparison (`__expected__/schema.graphql`)
5. GraphQL execution result snapshot comparison (`__expected__/query-result.json`) only when `query.graphql` exists

### `query.graphql`-Based Response Validation

- Each case may optionally include `query.graphql`
- Cases with `query.graphql` are auto-detected as `hasQuery=true`
- At runtime, the test loads `schema.ts`, executes `graphql({ schema, source: query })`, and serializes the result as JSON
- The JSON result is validated via `toMatchFileSnapshot` against `query-result.json`

This keeps query definitions data-oriented and separate from TypeScript test implementation.

### Snapshot File Responsibilities

- `__expected__/**/*.pb.pothos.ts`: expected generated code
- `__expected__/type-errors.txt`: expected type-check diagnostics (normally empty)
- `__expected__/schema.graphql`: expected GraphQL SDL
- `__expected__/query-result.json`: expected GraphQL execution result (only for cases with `query.graphql`)

## `testapis-proto` Fixture Strategy

All golden test fixture protos live under:

```text
devPackages/testapis-proto/proto/testapis/
```

Current package groups:

- `basic`: scalars, enums, nested, empty, proto3 presence, well-known types
- `behavior`: comment-derived behavior (`Required`, `Input only`, `Output only`)
- `options`: graphql extension options (schema/message/field/oneof/enum, nullability, deprecation, no_partial)
- `oneof`: message-only oneof and non-message oneof
- `imports`: same-dir, cross-package, oneof cross-file, squashed union, transitive import, symbol collision

Design rules:

- One concern per package
- Imports are explicit test axes (do not hide import behavior in unrelated cases)
- Runtime-sensitive behavior must have dedicated cases
- Keep packages minimal but complete for the scenario they target
- Use stable names that clearly describe test intent

## Golden Matrix

Default runtime variants (`ts-proto`, `protobuf-es-v1`, `protobuf-es`) include:

- `testapis.basic.empty`
- `testapis.basic.enums`
- `testapis.basic.nested`
- `testapis.basic.presence`
- `testapis.basic.scalars`
- `testapis.basic.wktypes`
- `testapis.behavior.field_comments`
- `testapis.imports.cross_pkg_b`
- `testapis.imports.oneof_cross_file`
- `testapis.imports.same_dir`
- `testapis.imports.squashed_union`
- `testapis.imports.transitive`
- `testapis.oneof.message_only`
- `testapis.options.deprecation`
- `testapis.options.field_nullability`
- `testapis.options.input_no_partial`
- `testapis.options.message_and_field`
- `testapis.options.schema`

Runtime-specific variants:

- `ts-proto-partial-inputs`: `testapis.options.message_and_field` with `partial_inputs`
- `ts-proto-forcelong`: `testapis.basic.scalars`, `testapis.basic.wktypes`
- `protobuf-es-v1` and `protobuf-es`: `testapis.oneof.non_message` with `ignore_non_message_oneof_fields`

## Per-Case Config (`config.json`)

Optional `config.json` in each case directory is used to control discovery-time behavior.

Supported keys:

- `additionalParams: string[]` (appended to plugin parameter string)
- `prefixMatch: boolean` (select nested proto paths under package prefix)

Examples:

- `additionalParams: ["emit_imported_files"]` for cross-package import emission cases
- `additionalParams: ["ignore_non_message_oneof_fields"]` for non-message oneof cases
- `prefixMatch: true` for packages where nested directory matching is required

## How To Add a New Case

1. Add or update fixture protos under `devPackages/testapis-proto/proto/testapis/...`
2. Run fixture generation if needed: `pnpm gen:testapis`
3. Create `tests/golden/<runtime-variant>/<proto-package>/`
4. Add at minimum `builder.ts`, `schema.ts`, and `tsconfig.json`
5. Add `config.json` when runtime parameters or `prefixMatch` are required
6. Add `query.graphql` if response-level validation is required
7. Generate/update expected files with `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts -u`
8. Review snapshot diffs to ensure no unintended behavior changes are included

## PR Review Checklist

- No unintended snapshot changes
- Type error snapshot changes are intentional
- `schema.graphql` and `query-result.json` diffs are behaviorally understood
- New cases follow runtime-variant and package naming conventions
- New fixture packages are single-purpose and do not mix unrelated concerns
