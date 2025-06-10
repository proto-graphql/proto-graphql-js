# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is proto-graphql-js, a Protobuf-First GraphQL Schema generator for JavaScript/TypeScript. It provides protoc plugins that generate GraphQL schema code from Protocol Buffer definitions.

### Supported GraphQL Libraries
- **Pothos**: via `protoc-gen-pothos` package
- **Nexus**: via `protoc-gen-nexus` package

### Supported Protobuf Libraries
- google-protobuf
- protobufjs
- ts-proto
- @bufbuild/protobuf (protobuf-es)

## Essential Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run unit tests
pnpm test

# Run E2E tests (generates test APIs first)
pnpm test:e2e

# Lint and format code (auto-fix)
pnpm lint

# Clean build artifacts
pnpm clean

# Run a specific test file
pnpm vitest path/to/test.spec.ts

# Run tests in watch mode
pnpm vitest --watch
```

## Repository Structure

This is a pnpm workspace monorepo with packages organized as:
- `/packages/` - Main packages (protoc-gen-pothos, protoc-gen-nexus, etc.)
- `/devPackages/` - Development utilities and test proto files
- `/e2e/` - End-to-end test suites with generated GraphQL schemas

Build orchestration uses Turbo for caching and parallel execution.

## Code Style and Conventions

- **ESM-first** with CommonJS compatibility (type: "module" in package.json)
- **TypeScript** with strict typing
- **Biome** for linting and formatting
- **No default exports** (enforced by linter)
- **Organized imports** (auto-organized by Biome)
- **2-space indentation**

## Testing Strategy

- Unit tests use Vitest
- E2E tests generate GraphQL schemas from test proto files and verify output
- Test matrix covers combinations of GraphQL libraries × Protobuf implementations
- Snapshot testing for generated schema verification

## Proto Compilation Workflow

The project generates GraphQL schema code from .proto files:

1. Proto files → protoc with custom plugin → GraphQL schema code
2. Plugins read proto descriptors and generate type-safe GraphQL definitions
3. Generated code integrates with Pothos or Nexus GraphQL libraries

Key proto extensions are defined in `/proto-graphql/proto/graphql/schema.proto`.

## Development Tips

- When modifying protoc plugins, rebuild before testing: `pnpm build`
- E2E tests require proto compilation: `pnpm test:e2e:gen` before `pnpm test:e2e`
- Use `pnpm lint` to auto-fix formatting issues
- Generated files are in `__generated__` directories (ignored by linter)