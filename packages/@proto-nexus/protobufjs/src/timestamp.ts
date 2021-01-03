import { common } from "protobufjs";

type Nullable<T> = { [K in keyof T]?: T[K] | null | undefined };

export function timestampToDate(input: Nullable<common.ITimestamp> | undefined | null): Date | null {
  if (input == null) return null;

  let seconds: number;

  if (typeof input.seconds === "number" || input.seconds == null) {
    seconds = input.seconds ?? 0;
  } else {
    seconds = input.seconds.high * (1 << 32) + input.seconds.low;
  }

  return new Date(seconds * 1000 + (input.nanos ?? 0) / 1e6);
}
