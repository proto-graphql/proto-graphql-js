---
"protoc-gen-pothos": patch
---

refactor: migrate from ts-poet to custom Printable API

- Remove ts-poet dependency
- Implement custom Printable API for code generation
- Use dprint-node for code formatting (same formatter ts-poet used internally)
- No changes to generated code output
