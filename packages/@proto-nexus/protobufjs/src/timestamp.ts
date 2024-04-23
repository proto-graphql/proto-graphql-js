import { type Transformer, registerTransformer } from "proto-nexus";
import type { common } from "protobufjs";

declare global {
  interface ProtoNexusTransformers {
    "google.protobuf.Timestamp": Transformer<common.ITimestamp, Date>;
  }
}

registerTransformer("google.protobuf.Timestamp", {
  protoToGql(v) {
    let seconds: number;

    if (typeof v.seconds === "number" || v.seconds == null) {
      seconds = v.seconds ?? 0;
    } else {
      seconds = v.seconds.high * (1 << 32) + v.seconds.low;
    }

    return new Date(seconds * 1000 + (v.nanos ?? 0) / 1e6) as any;
  },
  gqlToProto(v) {
    const ms = v.getTime();

    return {
      seconds: ms / 1000,
      nanos: ms * 1e6,
    };
  },
});
