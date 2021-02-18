import { common } from "protobufjs";
import { UnwrapFunc, Partial, Nullable } from "./utilityTypes";

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
