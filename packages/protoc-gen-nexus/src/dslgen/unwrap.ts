import { ProtoField } from "../protoTypes";
import { GenerationParams } from "./types";
import { uniqueImportAlias } from "./util";

export function getUnwrapFunc(
  f: ProtoField,
  opts: GenerationParams
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
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapInt32Value`,
    },
  },
  ".google.protobuf.UInt32Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapUInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapUInt32Value`,
    },
  },
  ".google.protobuf.Int64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapInt64Value`,
    },
  },
  ".google.protobuf.UInt64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapUInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapUInt64Value`,
    },
  },
  ".google.protobuf.FloatValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapFloatValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapFloatValue`,
    },
  },
  ".google.protobuf.DoubleValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapDoubleValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapDoubleValue`,
    },
  },
  ".google.protobuf.StringValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapStringValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapStringValue`,
    },
  },
  ".google.protobuf.BoolValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.unwrapBoolValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapBoolValue`,
    },
  },
  ".google.protobuf.Timestamp": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias(
        "@proto-nexus/google-protobuf"
      )}.timestampToDate`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.timestampToDate`,
    },
  },
};
