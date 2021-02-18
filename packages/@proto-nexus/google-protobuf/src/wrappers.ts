import * as wrappersPb from "google-protobuf/google/protobuf/wrappers_pb";
import { Nullable, UnwrapFunc } from "./utilityTypes";

export const unwrapInt32Value: UnwrapFunc<wrappersPb.Int32Value, number> = (input: Nullable<wrappersPb.Int32Value>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapInt64Value: UnwrapFunc<wrappersPb.Int64Value, number> = (input: Nullable<wrappersPb.Int64Value>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapUInt32Value: UnwrapFunc<wrappersPb.UInt32Value, number> = (
  input: Nullable<wrappersPb.UInt32Value>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapUInt64Value: UnwrapFunc<wrappersPb.UInt64Value, number> = (
  input: Nullable<wrappersPb.UInt64Value>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapFloatValue: UnwrapFunc<wrappersPb.FloatValue, number> = (input: Nullable<wrappersPb.FloatValue>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapDoubleValue: UnwrapFunc<wrappersPb.DoubleValue, number> = (
  input: Nullable<wrappersPb.DoubleValue>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapBoolValue: UnwrapFunc<wrappersPb.BoolValue, boolean> = (input: Nullable<wrappersPb.BoolValue>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const unwrapStringValue: UnwrapFunc<wrappersPb.StringValue, string> = (
  input: Nullable<wrappersPb.StringValue>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};
