# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

proto-graphql-js generates GraphQL schema definitions from Protocol Buffer definitions. It provides protoc plugins for multiple GraphQL frameworks (Pothos, Nexus) with support for various protobuf runtime libraries (ts-proto, google-protobuf, protobufjs, protobuf-es).

## Commands

```bash
# Build all packages
pnpm build

# Run unit tests
pnpm test

# Generate E2E test APIs and run E2E tests
pnpm test:e2e:gen
pnpm test:e2e

# Lint and format (Biome)
pnpm lint
```

Run a single test file:
```bash
pnpm vitest run path/to/file.test.ts
```

## Test Strategy

See `docs/development/testing-strategy.md`.

## Architecture

This is a Turbo monorepo with pnpm workspaces:

### Code Generation Plugins
- **`protoc-gen-pothos`** - Generates Pothos GraphQL DSL (uses ts-proto runtime)
- **`protoc-gen-nexus`** - Generates Nexus type definitions (supports google-protobuf, protobufjs)

### Core Libraries
- **`@proto-graphql/codegen-core`** - Shared code generation logic (type abstractions, printers)
- **`@proto-graphql/proto-descriptors`** - Protocol Buffer descriptor utilities
- **`@proto-graphql/protoc-plugin-helpers`** - Common protoc plugin utilities

### Runtime Libraries
- **`proto-nexus`** - Base Nexus runtime
- **`@proto-nexus/google-protobuf`** / **`@proto-nexus/protobufjs`** - Runtime-specific support
- **`@proto-graphql/scalars-protobuf-es`** - GraphQL scalars for protobuf-es

### Package Dependencies
```
protoc-gen-pothos  ─┐
                    ├─> @proto-graphql/codegen-core
protoc-gen-nexus   ─┘       │
                            ├─> @proto-graphql/protoc-plugin-helpers
                            └─> @proto-graphql/proto-descriptors
```

## E2E Testing

E2E tests are in `e2e/tests/` with naming pattern `{target}--{feature}--{proto_runtime}`. Test configuration matrix is defined in `e2e/tests.json`.

Proto definitions for tests: `devPackages/testapis-proto/`

## Code Conventions

- Named exports only (no default exports - enforced by Biome)
- ESM + CJS dual export for all packages
- Generated code goes to `__generated__/` directories (git-ignored for linting)
- Proto definitions managed via Buf (`buf.yaml`, `buf.gen.yaml`)

## Proto Integration

- Proto schema definitions in `proto-graphql/` git submodule
- Compile test protos: `scripts/compile-testapis-proto`
- Extensions compiled via: `scripts/compile-extensions-proto`
