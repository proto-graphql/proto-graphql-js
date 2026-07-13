---
"@proto-graphql/protoc-plugin-helpers": minor
---

feat: add `runtime_module` option to `parsePothosOptions`

Parses the `runtime_module` plugin parameter, controlling which module protoc-gen-pothos's generated RPC operation resolvers import `getClient` (`<runtime_module>`) and `callRpc` (`<runtime_module>/graphql`) from. Defaults to `@proto-graphql/connect-runtime`. Mirrors the parameter of the same name already supported by `parseDataloaderOptions`.
