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
    const ms = v.getTime();
    return new Timestamp().setSeconds(ms / 1000).setNanos(ms * 1e6) as any;
  },
});
