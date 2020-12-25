import { common, Long } from "protobufjs";

type Nullable<T> = { [K in keyof T]?: T[K] | null | undefined };

export function unwrapInt32Value(
  input: Nullable<common.IInt32Value> | undefined | null
): number | null {
  return input?.value ?? null;
}

export function unwrapInt64Value(
  input: Nullable<common.IInt64Value> | undefined | null
): number | Long | null {
  return input?.value ?? null;
}

export function unwrapUInt32Value(
  input: Nullable<common.IUInt32Value> | undefined | null
): number | null {
  return input?.value ?? null;
}

export function unwrapUInt64Value(
  input: Nullable<common.IUInt64Value> | undefined | null
): number | Long | null {
  return input?.value ?? null;
}

export function unwrapFloatValue(
  input: Nullable<common.IFloatValue> | undefined | null
): number | null {
  return input?.value ?? null;
}

export function unwrapDoubleValue(
  input: Nullable<common.IDoubleValue> | undefined | null
): number | null {
  return input?.value ?? null;
}

export function unwrapBoolValue(
  input: Nullable<common.IBoolValue> | undefined | null
): boolean | null {
  return input?.value ?? null;
}

export function unwrapStringValue(
  input: Nullable<common.IStringValue> | undefined | null
): string | null {
  return input?.value ?? null;
}
