// See tests/golden/protobuf-es/testapis.service.basic/vitest.config.ts for
// why this is needed: without it, "graphql" ends up loaded as two separate
// module instances (Vitest externalizes `@pothos/core`, whose own `import
// ... from "graphql"` resolves via Node's native loader, while this test
// file's own `import { graphql } from "graphql"` goes through Vite's
// transform pipeline) and graphql-js's `instanceOf` check throws "Cannot use
// GraphQLSchema ... from another module or realm".
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
