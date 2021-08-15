import * as wrappersPb from "google-protobuf/google/protobuf/wrappers_pb";
import { registerTransformer, Transformer, stringToNumber } from "proto-nexus";

declare global {
  interface ProtoNexusTransformers {
    "google.protobuf.Int32Value": Transformer<wrappersPb.Int32Value, number>;
    "google.protobuf.Int64Value": Transformer<wrappersPb.Int64Value, string>;
    "google.protobuf.UInt32Value": Transformer<wrappersPb.UInt32Value, number>;
    "google.protobuf.UInt64Value": Transformer<wrappersPb.UInt64Value, string>;
    "google.protobuf.FloatValue": Transformer<wrappersPb.FloatValue, number>;
    "google.protobuf.DoubleValue": Transformer<wrappersPb.DoubleValue, number>;
    "google.protobuf.BoolValue": Transformer<wrappersPb.BoolValue, boolean>;
    "google.protobuf.StringValue": Transformer<wrappersPb.StringValue, string>;
  }
}

registerTransformer("google.protobuf.Int32Value", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.Int32Value().setValue(v);
  },
});

registerTransformer("google.protobuf.Int64Value", {
  protoToGql(v) {
    return v.getValue().toString();
  },
  gqlToProto(v) {
    return new wrappersPb.Int64Value().setValue(stringToNumber(v));
  },
});

registerTransformer("google.protobuf.UInt32Value", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.UInt32Value().setValue(v);
  },
});

registerTransformer("google.protobuf.UInt64Value", {
  protoToGql(v) {
    return v.getValue().toString();
  },
  gqlToProto(v) {
    return new wrappersPb.UInt64Value().setValue(stringToNumber(v));
  },
});

registerTransformer("google.protobuf.FloatValue", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.FloatValue().setValue(v);
  },
});

registerTransformer("google.protobuf.DoubleValue", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.DoubleValue().setValue(v);
  },
});

registerTransformer("google.protobuf.BoolValue", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.BoolValue().setValue(v);
  },
});

registerTransformer("google.protobuf.StringValue", {
  protoToGql(v) {
    return v.getValue();
  },
  gqlToProto(v) {
    return new wrappersPb.StringValue().setValue(v);
  },
});
