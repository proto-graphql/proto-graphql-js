# ProtoNexus
[![CI](https://github.com/izumin5210/proto-nexus/workflows/CI/badge.svg)](https://github.com/izumin5210/proto-nexus/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/izumin5210/proto-nexus/badge.svg?branch=master)](https://coveralls.io/github/izumin5210/proto-nexus?branch=master)
[![GitHub](https://img.shields.io/github/license/izumin5210/proto-nexus)](./LICENSE)

Protobuf-First GraphQL Schemas with [GraphQL Nexus](https://nexusjs.org/)

## Packages

| package | description | version |
| ------- | ----------- | ------- |
| [protoc-gen-nexus](./packages/protoc-gen-nexus) | `protoc` plugin for generating Nexus type definitions | [![npm version](https://badge.fury.io/js/protoc-gen-nexus.svg)](https://badge.fury.io/js/protoc-gen-nexus) |
| [@proto-nexus/google-protobuf](./packages/@proto-nexus/google-protobuf) | Runtime library | [![npm version](https://badge.fury.io/js/%40proto-nexus%2Fgoogle-protobuf.svg)](https://badge.fury.io/js/%40proto-nexus%2Fgoogle-protobuf) |
| [@proto-nexus/protobufjs](./packages/@proto-nexus/protobufjs) | Runtime library | [![npm version](https://badge.fury.io/js/%40proto-nexus%2Fprotobufjs.svg)](https://badge.fury.io/js/%40proto-nexus%2Fprotobufjs) |

## Installation

```
yarn add nexus graphql
yarn add --dev protoc-gen-nexus

# if you generate code with `protoc --js_out`
yarn add @proto-nexus/google-protobuf

# if you generate code with protobufjs
yarn add @proto-nexus/protobufjs
```

## Usage

To generate Nexus type definitions from `.proto` files, you need to invoke following command:

```
protoc \
  -I ./node_modules/protoc-gen-nexus/include \
  -I <YOUR_PROTO_PATH> \
  --plugin=protoc-gen-nexus=`yarn bin protoc-gen-nexus` \
  --nexus_out=<DIST_DIR> \
  --nexus_opt="import_prefix=<YOUR_PROTO_PATH_OR_PACKAGE>" \
  path/to/file.proto
```

If you generate code with protobufjs, add `use_protobufjs` to `nexus_opt`

```
  --nexus_opt="import_prefix=<YOUR_PROTO_PATH_OR_PACKAGE>,use_protobufjs" \
```
