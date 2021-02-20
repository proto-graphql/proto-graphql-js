import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { Nullable, UnwrapFunc, WrapFunc } from "./utilityTypes";

export const timestampToDate: UnwrapFunc<Timestamp, Date> = (input: Nullable<Timestamp>) => {
  if (input == null) return null;

  return new Date(input.getSeconds() * 1000 + input.getNanos() / 1e6) as any;
};

export const timestampFromDate: WrapFunc<Date, Timestamp> = (input: Nullable<Date>) => {
  if (input == null) return null;

  const ms = input.getTime();
  return new Timestamp().setSeconds(ms / 1000).setNanos(ms * 1e6) as any;
};
