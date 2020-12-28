import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";

export function timestampToDate(
  input: Timestamp | undefined | null
): Date | null {
  if (input == null) return null;

  return new Date(input.getSeconds() * 1000 + input.getNanos() / 1e6);
}
