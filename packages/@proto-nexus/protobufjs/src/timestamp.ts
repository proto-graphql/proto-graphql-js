import { common } from "protobufjs";
import { UnwrapFunc, WrapFunc, Partial, Nullable } from "./utilityTypes";

export const timestampToDate: UnwrapFunc<Partial<common.ITimestamp>, Date> = (
  input: Nullable<Partial<common.ITimestamp>>
) => {
  if (input == null) return null;

  let seconds: number;

  if (typeof input.seconds === "number" || input.seconds == null) {
    seconds = input.seconds ?? 0;
  } else {
    seconds = input.seconds.high * (1 << 32) + input.seconds.low;
  }

  return new Date(seconds * 1000 + (input.nanos ?? 0) / 1e6) as any;
};

export const timestampFromDate: WrapFunc<Nullable<Date>, { seconds: number; nanos: number }> = (
  input: Nullable<Date>
) => {
  if (input == null) return null;

  const ms = input.getTime();

  return ({
    seconds: ms / 1000,
    nanos: ms * 1e6,
  } as common.ITimestamp) as any;
};
