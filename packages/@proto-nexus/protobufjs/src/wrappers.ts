import { common, Long } from "protobufjs";
import { UnwrapFunc, Partial, Nullable } from "./utilityTypes";

export const unwrapInt32Value: UnwrapFunc<Partial<common.IInt32Value>, number> = (
  input: Nullable<Partial<common.IInt32Value>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapInt64Value: UnwrapFunc<Partial<common.IInt64Value>, number | Long> = (
  input: Nullable<Partial<common.IInt64Value>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapUInt32Value: UnwrapFunc<Partial<common.IUInt32Value>, number> = (
  input: Nullable<Partial<common.IUInt32Value>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapUInt64Value: UnwrapFunc<Partial<common.IUInt64Value>, number | Long> = (
  input: Nullable<Partial<common.IUInt64Value>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapFloatValue: UnwrapFunc<Partial<common.IFloatValue>, number> = (
  input: Nullable<Partial<common.IFloatValue>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapDoubleValue: UnwrapFunc<Partial<common.IDoubleValue>, number> = (
  input: Nullable<Partial<common.IDoubleValue>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapBoolValue: UnwrapFunc<Partial<common.IBoolValue>, boolean> = (
  input: Nullable<Partial<common.IBoolValue>>
) => {
  return (input?.value ?? null) as any;
};

export const unwrapStringValue: UnwrapFunc<Partial<common.IStringValue>, string> = (
  input: Nullable<Partial<common.IStringValue>>
) => {
  return (input?.value ?? null) as any;
};
