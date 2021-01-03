import * as wrappersPb from "google-protobuf/google/protobuf/wrappers_pb";

export function unwrapInt32Value(input: wrappersPb.Int32Value | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapInt64Value(input: wrappersPb.Int64Value | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapUInt32Value(input: wrappersPb.UInt32Value | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapUInt64Value(input: wrappersPb.UInt64Value | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapFloatValue(input: wrappersPb.FloatValue | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapDoubleValue(input: wrappersPb.DoubleValue | undefined): number | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapBoolValue(input: wrappersPb.BoolValue | undefined): boolean | null {
  if (input === undefined) return null;
  return input.getValue();
}

export function unwrapStringValue(input: wrappersPb.StringValue | undefined): string | null {
  if (input === undefined) return null;
  return input.getValue();
}
