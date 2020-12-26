import { ProtoField } from "../protoTypes";
import { uniqueImportAlias } from "./util";

export function getUnwrapFunc(
  f: ProtoField,
  opts: { useProtobufjs?: boolean }
): UnwrapFunc | null {
  const uf = unwrapFuncs[f.protoTypeName];
  if (!uf) return null;
  return uf[opts.useProtobufjs ? "protobufjs" : "native"];
}

export type UnwrapFunc = {
  imports: string[];
  name: string;
};

const unwrapFuncs: Record<
  string,
  { native: UnwrapFunc; protobufjs: UnwrapFunc }
> = {
  ".google.protobuf.Int32Value": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapInt32Value`,
    },
  },
  ".google.protobuf.UInt32Value": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapUInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapUInt32Value`,
    },
  },
  ".google.protobuf.Int64Value": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapInt64Value`,
    },
  },
  ".google.protobuf.UInt64Value": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapUInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapUInt64Value`,
    },
  },
  ".google.protobuf.FloatValue": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapFloatValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapFloatValue`,
    },
  },
  ".google.protobuf.DoubleValue": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapDoubleValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapDoubleValue`,
    },
  },
  ".google.protobuf.StringValue": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapStringValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapStringValue`,
    },
  },
  ".google.protobuf.BoolValue": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.unwrapBoolValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.unwrapBoolValue`,
    },
  },
  ".google.protobuf.Timestamp": {
    native: {
      imports: ["proto-nexus"],
      name: `${uniqueImportAlias("proto-nexus")}.timestampToDate`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs-adapter"],
      name: `${uniqueImportAlias(
        "@proto-nexus/protobufjs-adapter"
      )}.timestampToDate`,
    },
  },
};
