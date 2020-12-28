# ProtoNexus
[![CI](https://github.com/izumin5210/proto-nexus/workflows/CI/badge.svg)](https://github.com/izumin5210/proto-nexus/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/izumin5210/proto-nexus/badge.svg?branch=master)](https://coveralls.io/github/izumin5210/proto-nexus?branch=master)
[![GitHub](https://img.shields.io/github/license/izumin5210/proto-nexus)](./LICENSE)

Build GraphQL schema from Protobuf and Nexus

## Packages

| package | description | version |
| ------- | ----------- | ------- |
| [protoc-gen-nexus](./packages/protoc-gen-nexus) | `protoc` plugin for generating Nexus type definitions | [![npm version](https://badge.fury.io/js/protoc-gen-nexus.svg)](https://badge.fury.io/js/protoc-gen-nexus) |
| [@proto-nexus/google-protobuf](./packages/@proto-nexus/google-protobuf) | Runtime library | [![npm version](https://badge.fury.io/js/proto-nexus.svg)](https://badge.fury.io/js/proto-nexus) |
| [@proto-nexus/protobufjs](./packages/@proto-nexus/protobufjs) | Runtime library | [![npm version](https://badge.fury.io/js/proto-nexus.svg)](https://badge.fury.io/js/proto-nexus) |

## Installation

```
yarn add proto-nexus nexus graphql
yarn add --dev protoc-gen-nexus
```

## Usage

To generate Nexus type definitions from `.proto` files, you need to invoke following command:

```
protoc \
  -I ./node_modules/protoc-gen-nexus/include \
  -I <YOUR_PROTO_PATH> \
  --plugin=protoc-gen-nexus=`yarn bin protoc-gen-nexus` \
  --nexus_out=<DIST_DIR> \
  --nexus_opt=import_prefix=<YOUR_PROTO_PATH_OR_PACKAGE> \
  path/to/file.proto
```
