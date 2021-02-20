import { ProtoField } from "../../protogen";
import { GenerationParams, uniqueImportAlias } from "./util";

export function getWrapFunc(f: ProtoField, opts: GenerationParams): WrapFunc | null {
  if (!f.type) return null;

  const uf = wrapFuncs[f.type.fullName.toString()];
  if (!uf) return null;
  return uf[opts.useProtobufjs ? "protobufjs" : "native"];
}

export function getUnwrapFunc(f: ProtoField, opts: GenerationParams): UnwrapFunc | null {
  if (!f.type) return null;

  const uf = unwrapFuncs[f.type.fullName.toString()];
  if (!uf) return null;
  return uf[opts.useProtobufjs ? "protobufjs" : "native"];
}

export type UnwrapFunc = {
  imports: string[];
  name: string;
};
export type WrapFunc = UnwrapFunc;

const unwrapFuncs: Record<string, { native: UnwrapFunc; protobufjs: UnwrapFunc }> = {
  "google.protobuf.Int32Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapInt32Value`,
    },
  },
  "google.protobuf.UInt32Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapUInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapUInt32Value`,
    },
  },
  "google.protobuf.Int64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapInt64Value`,
    },
  },
  "google.protobuf.UInt64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapUInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapUInt64Value`,
    },
  },
  "google.protobuf.FloatValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapFloatValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapFloatValue`,
    },
  },
  "google.protobuf.DoubleValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapDoubleValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapDoubleValue`,
    },
  },
  "google.protobuf.StringValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapStringValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapStringValue`,
    },
  },
  "google.protobuf.BoolValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.unwrapBoolValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.unwrapBoolValue`,
    },
  },
  "google.protobuf.Timestamp": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.timestampToDate`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.timestampToDate`,
    },
  },
};

const wrapFuncs: Record<string, { native: WrapFunc; protobufjs: WrapFunc }> = {
  "google.protobuf.Int32Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapInt32Value`,
    },
  },
  "google.protobuf.UInt32Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapUInt32Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapUInt32Value`,
    },
  },
  "google.protobuf.Int64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapInt64Value`,
    },
  },
  "google.protobuf.UInt64Value": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapUInt64Value`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapUInt64Value`,
    },
  },
  "google.protobuf.FloatValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapFloatValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapFloatValue`,
    },
  },
  "google.protobuf.DoubleValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapDoubleValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapDoubleValue`,
    },
  },
  "google.protobuf.StringValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapStringValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapStringValue`,
    },
  },
  "google.protobuf.BoolValue": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.wrapBoolValue`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.wrapBoolValue`,
    },
  },
  "google.protobuf.Timestamp": {
    native: {
      imports: ["@proto-nexus/google-protobuf"],
      name: `${uniqueImportAlias("@proto-nexus/google-protobuf")}.timestampFromDate`,
    },
    protobufjs: {
      imports: ["@proto-nexus/protobufjs"],
      name: `${uniqueImportAlias("@proto-nexus/protobufjs")}.timestampFromDate`,
    },
  },
};
