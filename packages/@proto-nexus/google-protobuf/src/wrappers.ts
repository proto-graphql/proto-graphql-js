import * as wrappersPb from "google-protobuf/google/protobuf/wrappers_pb";
import { Nullable, UnwrapFunc, WrapFunc } from "./utilityTypes";

export const wrapInt32Value: WrapFunc<Nullable<number>, wrappersPb.Int32Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.Int32Value().setValue(input) as any;
};

export const unwrapInt32Value: UnwrapFunc<wrappersPb.Int32Value, number> = (input: Nullable<wrappersPb.Int32Value>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapInt64Value: WrapFunc<Nullable<number>, wrappersPb.Int64Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.Int64Value().setValue(input) as any;
};

export const unwrapInt64Value: UnwrapFunc<wrappersPb.Int64Value, number> = (input: Nullable<wrappersPb.Int64Value>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapUInt32Value: WrapFunc<Nullable<number>, wrappersPb.UInt32Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.UInt32Value().setValue(input) as any;
};

export const unwrapUInt32Value: UnwrapFunc<wrappersPb.UInt32Value, number> = (
  input: Nullable<wrappersPb.UInt32Value>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapUInt64Value: WrapFunc<Nullable<number>, wrappersPb.UInt64Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.UInt64Value().setValue(input) as any;
};

export const unwrapUInt64Value: UnwrapFunc<wrappersPb.UInt64Value, number> = (
  input: Nullable<wrappersPb.UInt64Value>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapFloatValue: WrapFunc<Nullable<number>, wrappersPb.FloatValue> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.FloatValue().setValue(input) as any;
};

export const unwrapFloatValue: UnwrapFunc<wrappersPb.FloatValue, number> = (input: Nullable<wrappersPb.FloatValue>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapDoubleValue: WrapFunc<Nullable<number>, wrappersPb.DoubleValue> = (input: Nullable<number>) => {
  if (input == null) return null;
  return new wrappersPb.DoubleValue().setValue(input) as any;
};

export const unwrapDoubleValue: UnwrapFunc<wrappersPb.DoubleValue, number> = (
  input: Nullable<wrappersPb.DoubleValue>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapBoolValue: WrapFunc<Nullable<boolean>, wrappersPb.BoolValue> = (input: Nullable<boolean>) => {
  if (input == null) return null;
  return new wrappersPb.BoolValue().setValue(input) as any;
};

export const unwrapBoolValue: UnwrapFunc<wrappersPb.BoolValue, boolean> = (input: Nullable<wrappersPb.BoolValue>) => {
  if (input == null) return null;
  return input.getValue() as any;
};

export const wrapStringValue: WrapFunc<Nullable<string>, wrappersPb.StringValue> = (input: Nullable<string>) => {
  if (input == null) return null;
  return new wrappersPb.StringValue().setValue(input) as any;
};

export const unwrapStringValue: UnwrapFunc<wrappersPb.StringValue, string> = (
  input: Nullable<wrappersPb.StringValue>
) => {
  if (input == null) return null;
  return input.getValue() as any;
};
