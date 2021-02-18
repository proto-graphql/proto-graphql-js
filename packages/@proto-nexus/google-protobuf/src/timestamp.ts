import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { Nullable, UnwrapFunc } from "./utilityTypes";

export const timestampToDate: UnwrapFunc<Timestamp, Date> = (input: Nullable<Timestamp>) => {
  if (input == null) return null;

  return new Date(input.getSeconds() * 1000 + input.getNanos() / 1e6) as any;
};
