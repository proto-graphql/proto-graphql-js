// graphql-js's `instanceOf` check (used by `isSchema`/`printSchema`/etc.)
// throws "Cannot use GraphQLSchema ... from another module or realm" if the
// "graphql" package is ever loaded as two separate module instances. Root
// cause here: Vitest externalizes `@pothos/core` (a compiled node_modules
// package), so *its* internal `import ... from "graphql"` is resolved by
// Node natively (no `exports` map on "graphql" -> falls back to `main`,
// the CJS build). This test file's own `import { graphql } from "graphql"`
// instead goes through Vite's transform pipeline, which prefers the
// `module` field (the ESM build). Two different entry files, two distinct
// `GraphQLSchema` classes. Inlining every dependency forces the whole graph
// through the same resolution path, so there is only one "graphql" instance.
// biome-ignore lint/style/noDefaultExport: allow on external tools configs
export default {
  test: {
    server: {
      deps: {
        inline: [/./],
      },
    },
  },
};
