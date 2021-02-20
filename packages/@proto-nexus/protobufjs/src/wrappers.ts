import { common, Long } from "protobufjs";
import { UnwrapFunc, WrapFunc, Partial, Nullable } from "./utilityTypes";

export const wrapInt32Value: WrapFunc<Nullable<number>, common.IInt32Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IInt32Value) as any;
};

export const unwrapInt32Value: UnwrapFunc<Partial<common.IInt32Value>, number> = (
  input: Nullable<Partial<common.IInt32Value>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapInt64Value: WrapFunc<Nullable<number>, { value: number }> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IInt64Value) as any;
};

export const unwrapInt64Value: UnwrapFunc<Partial<common.IInt64Value>, number | Long> = (
  input: Nullable<Partial<common.IInt64Value>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapUInt32Value: WrapFunc<Nullable<number>, common.IUInt32Value> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IUInt32Value) as any;
};

export const unwrapUInt32Value: UnwrapFunc<Partial<common.IUInt32Value>, number> = (
  input: Nullable<Partial<common.IUInt32Value>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapUInt64Value: WrapFunc<Nullable<number>, { value: number }> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IUInt64Value) as any;
};

export const unwrapUInt64Value: UnwrapFunc<Partial<common.IUInt64Value>, number | Long> = (
  input: Nullable<Partial<common.IUInt64Value>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapFloatValue: WrapFunc<Nullable<number>, common.IFloatValue> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IFloatValue) as any;
};

export const unwrapFloatValue: UnwrapFunc<Partial<common.IFloatValue>, number> = (
  input: Nullable<Partial<common.IFloatValue>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapDoubleValue: WrapFunc<Nullable<number>, common.IDoubleValue> = (input: Nullable<number>) => {
  if (input == null) return null;
  return ({ value: input } as common.IDoubleValue) as any;
};

export const unwrapDoubleValue: UnwrapFunc<Partial<common.IDoubleValue>, number> = (
  input: Nullable<Partial<common.IDoubleValue>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapBoolValue: WrapFunc<Nullable<boolean>, common.IBoolValue> = (input: Nullable<boolean>) => {
  if (input == null) return null;
  return ({ value: input } as common.IBoolValue) as any;
};

export const unwrapBoolValue: UnwrapFunc<Partial<common.IBoolValue>, boolean> = (
  input: Nullable<Partial<common.IBoolValue>>
) => {
  return (input?.value ?? null) as any;
};

export const wrapStringValue: WrapFunc<Nullable<string>, common.IStringValue> = (input: Nullable<string>) => {
  if (input == null) return null;
  return ({ value: input } as common.IStringValue) as any;
};

export const unwrapStringValue: UnwrapFunc<Partial<common.IStringValue>, string> = (
  input: Nullable<Partial<common.IStringValue>>
) => {
  return (input?.value ?? null) as any;
};
