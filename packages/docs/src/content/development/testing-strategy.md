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
| Golden Test | `protoc-gen-pothos` generation output, types, and GraphQL behavior | `packages/protoc-gen-pothos/src/__tests__/golden/`, `tests/golden/` |
| Workspace Test Orchestration | Full monorepo test execution | `pnpm test` (`turbo run test`) |

## Code Generation CLI Testing Principles

For code generation CLIs such as `protoc-gen-pothos`, tests should use **golden file tests as the default strategy**.

- Test cases must be designed to be **MECE** (mutually exclusive, collectively exhaustive)
- Non-golden unit tests should be kept to a minimum
- Add unit tests only for logic that cannot be directly covered by golden file tests (for example: path normalization, error formatting, helper boundary behavior)

## Execution Policy

- Run all tests: `pnpm test`
- Run only `protoc-gen-pothos`: `pnpm --dir packages/protoc-gen-pothos test`
- Run only Golden Tests: `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts`
- Update snapshots: `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts -u`

In `turbo.json`, the `test` task depends on `^build` and `^build:test`.
This ensures that tests run against properly built dependency packages and generated test API artifacts.

## Golden Test Specification (`protoc-gen-pothos`)

### Directory Convention

Test cases are managed in the following two-level structure:

```text
tests/golden/<runtime-variant>/<proto-package>/
```

Examples:

- `tests/golden/ts-proto/testapis.enums/`
- `tests/golden/ts-proto-forcelong/testapis.primitives/`
- `tests/golden/protobuf-es-v1/testapis.wktypes/`

### What Each Test Case Validates

`packages/protoc-gen-pothos/src/__tests__/golden/golden.test.ts` runs the following checks for each discovered test case:

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

## How To Add a New Case

1. Create `tests/golden/<runtime-variant>/<proto-package>/`
2. Add at minimum `builder.ts`, `schema.ts`, and `tsconfig.json`
3. Add `query.graphql` if response-level validation is required
4. Generate/update expected files with: `pnpm --dir packages/protoc-gen-pothos vitest run src/__tests__/golden/golden.test.ts -u`
5. Review snapshot diffs to ensure no unintended behavior changes are included

## PR Review Checklist

- No unintended snapshot changes
- `query-result.json` line/column changes are understood (formatting-driven vs behavior-driven)
- Type error snapshot changes are intentional
- New test cases follow the runtime-variant and package naming conventions
