import { ProtoField } from "../protoTypes";
import { uniqueImportAlias } from "./util";

export function getUnwrapFunc(f: ProtoField): UnwrapFunc | null {
  return unwrapFuncs[f.protoTypeName] ?? null;
}

export type UnwrapFunc = {
  imports: string[];
  name: string;
};

const unwrapFuncs: Record<string, UnwrapFunc> = {
  ".google.protobuf.Int32Value": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapInt32Value`,
  },
  ".google.protobuf.UInt32Value": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapUInt32Value`,
  },
  ".google.protobuf.Int64Value": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapInt64Value`,
  },
  ".google.protobuf.UInt64Value": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapUInt64Value`,
  },
  ".google.protobuf.FloatValue": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapFloatValue`,
  },
  ".google.protobuf.DoubleValue": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapDoubleValue`,
  },
  ".google.protobuf.StringValue": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapStringValue`,
  },
  ".google.protobuf.BoolValue": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.unwrapBoolValue`,
  },
  ".google.protobuf.Timestamp": {
    imports: ["proto-nexus"],
    name: `${uniqueImportAlias("proto-nexus")}.timestampToDate`,
  },
};
