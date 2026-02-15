# Getting Started

This guide walks you through setting up protoc-gen-pothos to generate GraphQL schema from Protocol Buffers.

## Prerequisites

- Node.js (v18 or later recommended)
- [Buf CLI](https://buf.build/docs/installation)
- [Pothos GraphQL](https://pothos-graphql.dev/)

## Installation

```bash
npm install @proto-graphql/protoc-gen-pothos pothos
# or
pnpm add @proto-graphql/protoc-gen-pothos pothos
```

For ts-proto (recommended):

```bash
npm install ts-proto
```

## Project Setup

### 1. Create buf.yaml

Add the proto-graphql dependency to use GraphQL annotations:

```yaml
# proto/buf.yaml
version: v2
deps:
  - buf.build/proto-graphql/proto-graphql
```

### 2. Create buf.gen.yaml

Configure code generation for both ts-proto and protoc-gen-pothos:

```yaml
# proto/buf.gen.yaml
version: v2
plugins:
  # Generate TypeScript types with ts-proto
  - local: protoc-gen-ts_proto
    out: ../src/__generated__/proto
    opt:
      - esModuleInterop=true
      - unrecognizedEnum=false
      - outputTypeRegistry=true

  # Generate Pothos GraphQL schema
  - local: protoc-gen-pothos
    out: ../src/__generated__/pothos
    opt:
      - pothos_builder_path=../../builder
      - import_prefix=../proto
```

### 3. Create Your Proto File

```protobuf
// proto/example/user.proto
syntax = "proto3";

package example;

import "graphql/schema.proto";

message User {
  // Required. Output only.
  uint64 id = 1;
  // Required.
  string name = 2;
  string email = 3;
}
```

### 4. Create Pothos Builder

```typescript
// src/builder.ts
import SchemaBuilder from "@pothos/core";

const builder = new SchemaBuilder({});

export { builder };
```

### 5. Generate Code

```bash
cd proto
buf dep update
buf generate
```

### 6. Use Generated Types

```typescript
// src/schema.ts
import { builder } from "./builder";
import { User$Ref } from "./__generated__/pothos/example/user.pb.pothos";

// Register the generated type with your schema
builder.queryType({
  fields: (t) => ({
    user: t.field({
      type: User$Ref,
      resolve: () => ({
        id: 1n,
        name: "Alice",
        email: "alice@example.com",
      }),
    }),
  }),
});

export const schema = builder.toSchema();
```

