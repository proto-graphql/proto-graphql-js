import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { registerTransformer, Transformer } from "proto-nexus";

declare global {
  interface ProtoNexusTransformers {
    "google.protobuf.Timestamp": Transformer<Timestamp, Date>;
  }
}

registerTransformer("google.protobuf.Timestamp", {
  protoToGql(v) {
    return new Date(v.getSeconds() * 1000 + v.getNanos() / 1e6) as any;
  },
  gqlToProto(v) {
    const s = Math.floor(v.getTime() / 1000)
    const ns = v.getMilliseconds() * 1e6
    return new Timestamp().setSeconds(s).setNanos(ns)
  },
});
