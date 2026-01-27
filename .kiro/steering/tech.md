# Technology Stack

## Architecture

Protoc plugin architecture using `@bufbuild/protoplugin`. The plugin reads protobuf descriptors, transforms them into intermediate type representations, and generates Pothos DSL code.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 18+
- **Package Manager**: pnpm with workspace protocol
- **Monorepo Orchestration**: Turborepo

## Key Libraries

- **@bufbuild/protobuf** / **@bufbuild/protoplugin**: Protobuf parsing and plugin framework
- **Pothos GraphQL**: Target GraphQL schema builder
- **dprint-node**: Code formatting for generated output
- **case-anything** / **change-case**: Naming convention transformations

## Development Standards

### Type Safety
- TypeScript strict mode enabled via `@tsconfig/strictest`
- ESM modules with dual CJS/ESM distribution
- Explicit type exports alongside implementation

### Code Quality
- Biome for linting and formatting (replaces ESLint/Prettier)
- No default exports rule (`noDefaultExport: error`)
- Unused imports flagged as errors

### Testing
- Vitest for unit and integration tests
- Golden tests for generated code verification (file-based snapshots)
- `pnpm gen:testapis` generates proto stubs required before running tests

## Development Environment

### Required Tools
- Node.js 18+
- pnpm 10+
- Buf CLI (for protobuf compilation)

### Common Commands
```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Generate testapis proto stubs (required before tests)
pnpm gen:testapis

# Check/fix linting and formatting
pnpm check
```

## Key Technical Decisions

- **Protoplugin over custom parsing**: Uses Buf's official plugin framework for reliable protobuf handling
- **Intermediate type representation**: Codegen-core defines abstract types (ObjectType, EnumType, etc.) that are independent of target DSL
- **Dual ESM/CJS output**: tsup builds both formats for maximum compatibility
- **Printer pattern**: Code generation uses composable printer functions returning Printable arrays

---
_Document standards and patterns, not every dependency_
