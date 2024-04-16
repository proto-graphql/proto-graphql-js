---
"@proto-graphql/protoc-plugin-helpers": minor
"@proto-graphql/codegen-core": minor
"protoc-gen-pothos": minor
"protoc-gen-nexus": minor
---

support scalar option for define custom scalar type mappings instead of legacy option

BREAKING CHANGE: drop `long_number` and `custom_type` options

#### Migration

`long_number` and `custom_type` can be replaced with `scalar`.

```patch
 plugins:
   name: pothos
   out: src/__generated__/schema
   opt:
-    - long_number=Int
+    - scalar=int64=Int
+    - scalar=uint64=Int
+    - scalar=sint64=Int
+    - scalar=fixed64=Int
+    - scalar=sfixed64=Int
+    - scalar=google.protobuf.Int64Value=Int
+    - scalar=google.protobuf.UInt64Value=Int
+    - scalar=google.protobuf.SInt64Value=Int
+    - scalar=google.protobuf.Fixed64Value=Int
+    - scalar=google.protobuf.SFixed64Value=Int
```

```patch
 plugins:
   name: pothos
   out: src/__generated__/schema
   opt:
-    - custom_type=google.type.Date=Date
+    - scalar=google.type.Date=Date
```
