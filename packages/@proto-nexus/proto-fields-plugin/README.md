# @proto-nexus/proto-fields-plugin

> **⚠️ DEPRECATED**: This package is no longer maintained.
> GraphQL Nexus development has stopped.
> Please consider migrating to [protoc-gen-pothos](https://github.com/proto-graphql/proto-graphql-js/tree/main/packages/protoc-gen-pothos).

[![npm version](https://badge.fury.io/js/%40proto-nexus%2Fproto-fields-plugin.svg)](https://badge.fury.io/js/%40proto-nexus%2Fproto-fields-plugin) |

Nexus plugin for building subset types from proto-nexus's artifacts

```proto
// profile.proto

message Profile {
  // Required. User's first name.
  string first_name = 1;
  // Required. User's middle name.
  string middle_name = 2;
  // Required. User's last name.
  string last_name = 3;

  // Required.
  string introduction = 4;
}
```

```ts
import { makeSchema, inputObjectType } from "nexus";
import { protoFieldsPlugin } from "@proto-nexus/proto-fields-plugin";

import { ProfileInput } from "./path/to/protoc-gen-plugin-artifacts/profile_pb_nexus.ts";

const NameInput = inputObjectType({
  name: "NameInput",
  definition(t) {
    t.fromProto(ProfileInput, ["firstName", "middleName", "lastName"]);
  }
})

export schema = makeSchema({
  types: [ProfileInput, NameInput],
  plugins: [protoFieldsPlugin()],
})

// # Types will be generated:
//
// input NameInput {
//   """Required. User's first name."""
//   firstName: String!
//
//   """Required. User's middle name."""
//   middleName: String!
//
//   """Required. User's last name."""
//   lastName: String!
// }
//
// input ProfileInput {
//   """Required. User's first name."""
//   firstName: String!
//
//   """Required. User's middle name."""
//   middleName: String!
//
//   """Required. User's last name."""
//   lastName: String!
//
//   """Required."""
//   introduction: String!
// }
```
